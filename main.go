package main

import (
	"fmt"
	"os"
	"strings"

	"blog-server/internal/config"
	"blog-server/internal/logger"
	"blog-server/internal/middleware"
	"blog-server/internal/models"
	"blog-server/internal/oss"
	"blog-server/internal/redis"
	"blog-server/internal/rsa"
	"blog-server/internal/server"
	"blog-server/internal/version"
	"blog-server/router"

	"github.com/urfave/cli"
)

//	@title			Blog-server
//	@version		1.0
//	@description	This is a sample blog server.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	MOITY
//	@contact.url	http://www.moity-soeoe.com
//	@contact.email	ouxiangming_moi@foxmail.com

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// 	@host			127.0.0.1:9997
// 	@BasePath		/api/v1

func main() {
	app := cli.NewApp()
	app.Name = getModuleName("blog-server", "")
	app.Usage = fmt.Sprintf("%v -c config/config_original.yaml", app.Name)
	printVersion := false

	app.Flags = []cli.Flag{
		cli.StringFlag{
			Name:  "conf, c",
			Value: "config/config_original.yaml",
			Usage: "config/config_{original|local|dev|test|pre|prod}.yaml",
		},
		cli.BoolFlag{
			Name:        "version, v",
			Required:    false,
			Usage:       "-v",
			Destination: &printVersion,
		},
	}

	app.Action = func(c *cli.Context) error {
		if printVersion {
			fmt.Printf("{%#v}", version.Get())
			return nil
		}

		// init config
		conf := c.String("conf")
		if err := config.Init(conf); err != nil {
			return err
		}

		// init zap logger
		if err := logger.InitLogger(config.Conf.App.LogOutputDir); err!= nil {
			return err
		}

		// init RSA keys
		if privateKey, publicKey, err := rsa.InitRSAKeys(config.Conf.App.RsaPrivateKeyPath, config.Conf.App.RsaPublicKeyPath); err != nil {
			return err
		}else {
			// 将密钥保存到全局变量中
			rsa.PrivateKey = privateKey
			rsa.PublicKey = publicKey
		}

		// init oss, such as minio
		if err := oss.InitMinIO(config.Conf.Minio); err != nil {
			return err
		}

		// init database
		if err := models.Init(config.Conf.DataBase); err != nil {
			return err
		}
		defer models.Close()

		// init redis
		if err := redis.Init(config.Conf.Redis); err!= nil {
			return err
		}
		defer redis.Close()
		
		// init server
		mainServer := server.NewServer()

		// init middleware
		if err := middleware.InitMiddleware(mainServer); err != nil {
			return err
		}

		// init router
		router.InitRouter(mainServer)
		RegisterLoggerForGin(mainServer)

		// start server
		if err := mainServer.GinEngine.Run(fmt.Sprintf("%s:%s", config.Conf.App.Addr, config.Conf.App.Port)); err != nil {
			return err
		}
		return nil
	}

	err := app.Run(os.Args)
	if err != nil {
		fmt.Printf("startup service failed, err: %v\n", err)
	}
}

func RegisterLoggerForGin(server *server.Server) {
	// register
	server.GinEngine.Use(logger.GinLogger(logger.Logger))
	server.GinEngine.Use(logger.GinRecovery(logger.Logger, true))
}

func getModuleName(defaultName string, name string) string {
	if name != "" {
		return name
	}
	data, err := os.ReadFile("go.mod")
	if err != nil {
		return defaultName
	}
	firstLine := strings.TrimSpace(strings.Split(string(data), "\n")[0])
	if strings.HasPrefix(firstLine, "module") {
		return strings.TrimSpace(strings.TrimPrefix(firstLine, "module"))
	}
	return defaultName
}
