#!/bin/bash
if [ -f "/project/config/nginx" ]
then
  rm /etc/nginx/sites-enabled/default
  ln -s /project/config/nginx-site.conf /etc/nginx/sites-enabled/default
fi

/usr/sbin/nginx -g "daemon off;"
