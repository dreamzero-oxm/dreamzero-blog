sudo systemctl stop blog-server
sudo cp ./build/blog-server /etc/moity-blog/blog-server
sudo cp ./config/config_dev.yaml /etc/moity-blog/config.yaml
sudo cp -r ./public /etc/moity-blog/public
sudo systemctl start blog-server
sudo systemctl status blog-server
