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
#you ARE running this from the git directory, right?
VOLUME $GITPATH:/git


# Things to create
# TODO: make script runner - runs all scripts in directory
# TODO: make logger - Logs to dir sanely
# TODO: sql example data installer
# TODO: node runner
# TODO: symlinker
# TODO: package installer


# run pre-install scripts
RUN $UTILDIR/script-runner $SERVDIR/scripts/pre | $UTILDIR/logger $LOGDIR/script-pre


# symlink directories from git
RUN $UTILDIR/symlinker $SERVDIR/config/symlinks | $UTILDIR/logger $LOGDIR/symlinks


# start services
RUN $UTILDIR/service-starter $SERVDIR/config/services | /$UTILDIR/logger $LOGDIR/service-starter


#install DB tables, install example data
RUN $UTILDIR/script-runner $SERVDIR/database/setup/ | $UTILDIR/logger $LOGDIR/database-setup/database-setup
RUN $UTILDIR/sql-inserter $SERVDIR/database/sample/ | $UTILDIR/logger $LOGDIR/database-samples/sql-inserter


#install packages
RUN $UTILDIR/package-installer -f $SERVDIR/config/packages | $UTILDIR/logger $LOGDIR/package-installer/package-installer


#run nodejs projects
RUN $UTILDIR/node-runner $SERVDIR/node | $UTILDIR/logger $LOGDIR/node-runner/node-runner


# run post-install scripts
RUN $UTILDIR/script-runner $SERVDIR/scripts/post | $UTILDIR/logger $LOGDIR/script-post/script-post

