FROM reidwelliver/vs-base:latest
MAINTAINER Reid Welliver

ARG SERV=test
ARG GITPATH=./
ARG GITMOUNT=/git

ARG GITLOG=$GITMOUNT/build/$SERV/log
ARG GITSERV=$GITMOUNT/$SERV
ARG GITUTIL=$GITMOUNT/utils

#mounts current directory to /git in container
#you ARE running this from the git directory, right?
VOLUME $GITPATH:/git


# Things to create
# TODO: make script runner - runs all scripts in directory
# TODO: make logger - Logs to dir sanely
# TODO: sql example data installer
# TODO: node runner
# TODO: symlinker
# TODO: apt package installer

# run pre-install scripts
RUN $GITUTIL/script-runner $GITSERV/scripts/pre/ | $GITUTIL/logger $GITLOG/script-pre


# symlink directories from git
RUN /git/utils/symlinker /git/$SERV/config/symlinks | /git/utils/logger /git/build/$SERV/log/symlinks


# start services
RUN service mysql start | /git/utils/logger /git/build/$SERV/log/mysql-start
RUN service nginx start | /git/utils/logger /git/build/$SERV/log/nginx-start


#install DB tables, install example data
RUN /git/utils/script-runner /git/$SERV/database/setup/ | /git/utils/logger /git/build/$SERV/log/database-setup
RUN /git/utils/sql-inserter /git/$SERV/database/sample/ | /git/utils/logger /git/build/$SERV/log/database-samples

#install packages
RUN /git/utils/apt-installer /git/$SERV/config/packages | /git/utils/logger /git/build/$SERV/log/apt-installer

#run nodejs projects
RUN /git/utils/node-runner /git/$SERV/node/ | /git/utils/logger /git/build/$SERV/log/node-runner


# run post-install scripts
RUN /git/utils/script-runner /git/$SERV/scripts/pre/ | /git/utils/logger /git/build/$SERV/log/script-post

