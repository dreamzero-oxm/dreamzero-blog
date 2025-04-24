git reset --hard
git pull
go mod tidy
swag init
make
systemctl stop blog-server
cp ./build/blog-server /etc/moity-blog/blog-server
cp ./config/config_dev.yaml /etc/moity-blog/config.yaml
systemctl start blog-server
systemctl status blog-server