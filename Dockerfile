FROM reidwelliver/vs-base:latest
MAINTAINER Reid Welliver

ARG BUILD_DEBUG=""
ARG GITMOUNT=/git

ARG LOGDIR=$GITMOUNT/build/$SERV/log
ARG SERV=test-component
ARG UTILDIR=$GITMOUNT/utils


# Things to create
# TODO: sql example data installer
# TODO: template for installing nginx

# Add this folder to the container's image at /git
COPY . $GITMOUNT/

# run pre-install scripts
RUN $UTILDIR/script-runner $GITMOUNT/$SERV/scripts/pre | $UTILDIR/logger script-pre


# symlink directories from git
RUN $UTILDIR/symlinker $GITMOUNT/$SERV/config/symlinks | $UTILDIR/logger symlinks


# start services
RUN $UTILDIR/service-starter $GITMOUNT/$SERV/config/services | /$UTILDIR/logger service-starter


#install DB tables, install example data
RUN $UTILDIR/script-runner $GITMOUNT/$SERV/database/setup/ | $UTILDIR/logger database-setup

# TODO: script to install samples
# RUN $UTILDIR/sql-inserter $GITMOUNT/$SERV/database/sample/ | $UTILDIR/logger sql-inserter


#install packages
RUN $UTILDIR/package-installer -f $GITMOUNT/$SERV/config/packages | $UTILDIR/logger package-installer


#run nodejs projects
RUN $UTILDIR/node-runner $GITMOUNT/$SERV/node | $UTILDIR/logger node-runner


# run post-install scripts
RUN $UTILDIR/script-runner $GITMOUNT/$SERV/scripts/post | $UTILDIR/logger script-post

# Entrypoint command
ENTRYPOINT ["/bin/bash"]
CMD ["ls"]