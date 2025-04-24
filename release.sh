git reset --hard
git pull
go mod tidy
swag init
make
systemctl stop blog-server
cp ./build/blog-server /etc/moity-blog/blog-server
systemctl start blog-server
systemctl status blog-server