FROM reidwelliver/vs-base:latest
MAINTAINER Reid Welliver

ARG SERV=test
ARG GITPATH=./
ARG GITMOUNT=/git
ARG UTILDBG=""

ARG LOGDIR=$GITMOUNT/build/$SERV/log
ARG SERVDIR=$GITMOUNT/$SERV
ARG UTILDIR=$GITMOUNT/utils

#mounts current directory to /git in container
VOLUME $GITPATH:/git


# Things to create
# TODO: sql example data installer
# TODO: template for installing nginx


# run pre-install scripts
RUN $UTILDIR/script-runner $SERVDIR/scripts/pre | $UTILDIR/logger script-pre


# symlink directories from git
RUN $UTILDIR/symlinker $SERVDIR/config/symlinks | $UTILDIR/logger symlinks


# start services
RUN $UTILDIR/service-starter $SERVDIR/config/services | /$UTILDIR/logger service-starter


#install DB tables, install example data
RUN $UTILDIR/script-runner $SERVDIR/database/setup/ | $UTILDIR/logger database-setup

# TODO: script to install samples
# RUN $UTILDIR/sql-inserter $SERVDIR/database/sample/ | $UTILDIR/logger sql-inserter


#install packages
RUN $UTILDIR/package-installer -f $SERVDIR/config/packages | $UTILDIR/logger package-installer


#run nodejs projects
RUN $UTILDIR/node-runner $SERVDIR/node | $UTILDIR/logger node-runner


# run post-install scripts
RUN $UTILDIR/script-runner $SERVDIR/scripts/post | $UTILDIR/logger script-post

