package main

import (
	"fmt"
	"os"

	"github.com/urfave/cli"
	"mlm.com/internal/config"
	"mlm.com/internal/logger"
	"mlm.com/internal/version"
	"mlm.com/router"
)

//	@title			Swagger Example API
//	@version		1.0
//	@description	This is a sample server Petstore server.
//	@termsOfService	http://swagger.io/terms/

//	@contact.name	API Support
//	@contact.url	http://www.swagger.io/support
//	@contact.email	support@swagger.io

//	@license.name	Apache 2.0
//	@license.url	http://www.apache.org/licenses/LICENSE-2.0.html

// @host		petstore.swagger.io:8080
// @BasePath	/api/v1
func main() {
	app := cli.NewApp()
	app.Name = "mlm-server"
	app.Usage = "mlm-server -c config/config_original.json"
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

		// init zap logger
		logger.InitLogger()

		conf := c.String("conf")
		if err := config.Init(conf); err != nil {
			return err
		}

		server := router.InitRouter()
		RegisterLoggerForGin(server)

		if err := server.GinEngine.Run(config.Conf.App.Port); err != nil {
			return err
		}
		return nil
	}

	err := app.Run(os.Args)
	if err != nil{
		fmt.Printf("startup service failed, err: %v\n", err)
	}
}

func RegisterLoggerForGin(server *router.Server) {
	// register
	server.GinEngine.Use(logger.GinLogger(logger.Logger))
	server.GinEngine.Use(logger.GinRecovery(logger.Logger, true))
}
