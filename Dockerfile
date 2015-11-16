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
RUN $UTILDIR/script-runner -d $GITMOUNT/$SERV/scripts/pre | $UTILDIR/logger -f script-pre


# symlink directories from git
RUN $UTILDIR/symlinker -f $GITMOUNT/$SERV/config/symlinks | $UTILDIR/logger -f symlinks


# start services
RUN $UTILDIR/service-starter -f $GITMOUNT/$SERV/config/services | /$UTILDIR/logger -f service-starter


#install DB tables, install example data
RUN $UTILDIR/script-runner -d $GITMOUNT/$SERV/database/setup/ | $UTILDIR/logger -f database-setup

# TODO: script to install samples
# RUN $UTILDIR/sql-inserter -d $GITMOUNT/$SERV/database/sample/ | $UTILDIR/logger -f sql-inserter


#install packages
RUN $UTILDIR/package-installer -f $GITMOUNT/$SERV/config/packages | $UTILDIR/logger -f package-installer


#run nodejs projects
RUN $UTILDIR/node-runner -d $GITMOUNT/$SERV/node | $UTILDIR/logger -f node-runner


# run post-install scripts
RUN $UTILDIR/script-runner -d $GITMOUNT/$SERV/scripts/post | $UTILDIR/logger -f script-post

# Entrypoint command
ENTRYPOINT ["/bin/bash"]
CMD ["ls"]