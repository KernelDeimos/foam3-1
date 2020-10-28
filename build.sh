#!/bin/bash
#
# Deploy nanopay application
#
# See options for quick compile cycles without complete deployment.
#

# Exit on first failure
set -e

function warning {
    echo -e "\033[0;33mWARNING :: ${1}\033[0;0m"
}

function rmdir {
    if test -d "$1" ; then
        rm -rf "$1"
    fi
}

function rmfile {
    if test -f "$1" ; then
        rm -f "$1"
    fi
}

function quit {
  # Unset error on exit
  set +e
  exit $1
}

function install {
    MACOS='darwin*'

    cd "$PROJECT_HOME"

    git submodule init
    git submodule update

    npm install

    if [[ $IS_MAC -eq 1 ]]; then
        mkdir -p "$NANOPAY_HOME/journals"
        mkdir -p "$NANOPAY_HOME/logs"
    fi

    # git hooks
    git config core.hooksPath .githooks
    git config submodule.recurse true
}

function deploy_documents {
    echo "INFO :: Deploying Documents"

    # prepare documents
    cd "$PROJECT_HOME"

    declare -a sources=(
        "foam2/src"
        "nanopay/src"
        "documents"
    )

    declare -a exclude=(
        "foam2/src/com/google/flow"
    )

    for dir in "${sources[@]}"; do
        find ${dir} -type f \( -name "*.flow" \) | while read path; do
            # skip excluded directories
            skip="no"
            for ex in "${excludes[@]}"; do
                if [ "${path:0:${#ex}}" = "$ex" ]; then
                    skip="yes"
                    break
                fi
            done
            if [ "$skip" = "yes" ]; then
                continue
            fi

            # determine document name
            name=$(basename $path)
            name=${name%.flow}
            # documents named "doc" should be renamed
            if [ "$name" = "doc" ]; then
                simplePath=${path:(1 + ${#dir})}
                simplePath=${simplePath%.flow}
                name=${simplePath//\//-}
            fi
            # copy this document to target
            cp -f "$path" "$DOCUMENT_OUT/$name.flow"
            # if not jar build, copy to runtime directory
            if [ "$RUN_JAR" -eq 0 ]; then
                cp -f "$path" "$DOCUMENT_HOME/$name.flow"
            fi
        done
    done
}

function deploy_journals {
    echo "INFO :: Deploying Journals"

    # prepare journals
    cd "$PROJECT_HOME"

    JOURNALS=tools/journals
    if [[ ! -f  $JOURNALS ]]; then
        echo "ERROR :: Missing ${JOURNALS} file."
        quit 1
    fi

    if [ ! -d target ]; then
        mkdir -p target
    fi

    if [ "$DISABLE_LIVESCRIPTBUNDLER" -eq 1 ]; then
        if [ -z ${EXPLICIT_JOURNALS} ]; then
            EXPLICIT_JOURNALS="-E"
        else
            EXPLICIT_JOURNALS="${EXPLICIT_JOURNALS}tools/journal_extras/disable_livescriptbundler"
        fi
    fi

    if [ "$DELETE_RUNTIME_JOURNALS" -eq 1 ] || [ $CLEAN_BUILD -eq 1 ]; then
        ./tools/findJournals.sh -J${JOURNAL_CONFIG} ${EXPLICIT_JOURNALS} < $JOURNALS | ./find.sh -O${JOURNAL_OUT}
    else
        ./tools/findJournals.sh -J${JOURNAL_CONFIG} ${EXPLICIT_JOURNALS} < $JOURNALS > target/journal_files
        gradle findSH -PjournalOut=${JOURNAL_OUT} -PjournalIn=target/journal_files $GRADLE_FLAGS
    fi

    if [[ $? -eq 1 ]]; then
        quit 1
    fi

    if [ "$LIQUID_DEMO" -eq 1 ]; then
        node tools/liquid_journal_script.js

        if [[ $? -eq 1 ]]; then
            quit 1
        fi
    fi

    if [ "$RUN_JAR" -eq 0 ]; then
        while read -r file; do
            journal_file="$file".0
            if [ -f "$JOURNAL_OUT/$journal_file" ]; then
                cp "$JOURNAL_OUT/$journal_file" "$JOURNAL_HOME/$journal_file"
            fi
        done < $JOURNALS
    fi
}

function migrate_journals {
    if [ -f "tools/migrate_journals.sh" ]; then
        ./tools/migrate_journals.sh "$JOURNAL_HOME"
    fi
}

function clean {
    if [ "$CLEAN_BUILD" -eq 1 ] &&
           [ "$RESTART_ONLY" -eq 0 ]; then
        echo "INFO :: Cleaning Up"

        if [ "${RUN_JAR}" -eq 1 ]; then
            tmp=$PWD
            echo PWD=$tmp
            cd "${NANOPAY_HOME}/bin"
            rm -rf *
            cd "../lib"
            rm -rf *
            cd "$tmp"
        fi

        gradle clean $GRADLE_FLAGS
    fi
}

function build_jar {
    if [ "$TEST" -eq 1 ] || [ "$RUN_JAR" -eq 1 ]; then
        gradle buildJar $GRADLE_FLAGS
    else
        gradle build $GRADLE_FLAGS
    fi

    if [ "${RUN_JAR}" -eq 1 ] || [ "$TEST" -eq 1 ]; then
        cp -r deploy/bin/* "${NANOPAY_HOME}/bin/"
        cp -r deploy/etc/* "${NANOPAY_HOME}/etc/"
        cp -r target/lib/* "${NANOPAY_HOME}/lib/"
    fi
}

function package_tar {
    gradle tarz $GRADLE_FLAGS
}

function delete_runtime_journals {
  if [[ $DELETE_RUNTIME_JOURNALS -eq 1 && IS_AWS -eq 0 ]]; then
    echo "INFO :: Runtime journals deleted."
    rm -rf "$JOURNAL_HOME"
    mkdir -p "$JOURNAL_HOME"
  fi
}

function delete_runtime_logs {
  if [[ $DELETE_RUNTIME_LOGS -eq 1 && IS_AWS -eq 0 ]]; then
    echo "INFO :: Runtime logs deleted."
    rm -rf "$LOG_HOME"
    mkdir -p "$LOG_HOME"
  fi
}

function stop_nanos {
    echo "INFO :: Stopping nanos..."

    # TODO: with instances there may be more than one.
    # development
    RUNNING_PID=$(ps -ef | grep -v grep | grep "java.*-DNANOPAY_HOME" | awk '{print $2}')
    if [ -z "$RUNNING_PID" ]; then
        # production
        RUNNING_PID=$(ps -ef | grep -v grep | grep "java -server -jar ${NANOPAY_HOME}/lib/nanopay" | awk '{print $2}')
    fi
    if [ -f "$NANOS_PIDFILE" ]; then
        PID=$(cat "$NANOS_PIDFILE")
        if [[ "$PID" != "$RUNNING_PID" ]] && [ "$STOP_ONLY" -eq 1 ]; then
            PID=$RUNNING_PID
        fi
    fi

    if [ -z "$PID" ]; then
        echo "INFO :: PID and/or file $NANOS_PIDFILE not found, nothing to stop?"
    else
        TRIES=0
        SIGNAL=TERM
        set +e
        while kill -0 $PID &>/dev/null; do
            kill -$SIGNAL $PID
            sleep 1
            TRIES=$(($TRIES + 1))
            if [ $TRIES -gt 5 ]; then
                SIGNAL=KILL
            elif [ $TRIES -gt 10 ]; then
                echo "ERROR :: Failed to kill nanos!"
                quit 1
            fi
        done
        set -e

        rmfile "$NANOS_PIDFILE"
    fi
    delete_runtime_journals
    delete_runtime_logs
}

function status_nanos {
    if [ ! -f "$NANOS_PIDFILE" ]; then
        echo "INFO :: Nanos not running."
        quit 1
    elif kill -0 $(cat "$NANOS_PIDFILE") &>/dev/null ; then
        echo "INFO :: Nanos running."
        quit 0
    else
        echo "ERROR :: Stale PID file."
        quit -1
    fi
}

function start_nanos {
    if [ "${RUN_JAR}" -eq 1 ]; then
        OPT_ARGS=

        OPT_ARGS="${OPTARGS} -V$(gradle -q getVersion)"

        if [ ! -z ${RUN_USER} ]; then
            OPT_ARGS="${OPT_ARGS} -U${RUN_USER}"
        fi

        ${NANOPAY_HOME}/bin/run.sh -Z${DAEMONIZE} -D${DEBUG} -S${DEBUG_SUSPEND} -P${DEBUG_PORT} -N${NANOPAY_HOME} -W${WEB_PORT} -H${HOST_NAME} -j${PROFILER} -J${PROFILER_PORT} ${OPT_ARGS}
    else
        cd "$PROJECT_HOME"

        JAVA_OPTS="-Dhostname=${HOST_NAME} ${JAVA_OPTS}"
        if [ "$DEBUG" -eq 1 ]; then
            JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=${DEBUG_SUSPEND},address=${DEBUG_PORT} ${JAVA_OPTS}"
        fi
        if [ ! -z "$WEB_PORT" ]; then
            JAVA_OPTS="${JAVA_OPTS} -Dhttp.port=$WEB_PORT"
        fi

        # New versions of FOAM require the new nanos.webroot property to be explicitly set to figure out Jetty's resource-base.
        # To maintain the expected familiar behaviour of using the root-dir of the NP proj as the webroot we set the property
        # to be the same as the $PWD -- which at this point is the $PROJECT_HOME
        JAVA_OPTS="-Dnanos.webroot=${PWD} ${JAVA_OPTS}"

        CLASSPATH=$(JARS=("target/lib"/*.jar); IFS=:; echo "${JARS[*]}")
        CLASSPATH="build/classes/java/main:$CLASSPATH"

        MESSAGE="Starting nanos ${INSTANCE}"
        if [ "$TEST" -eq 1 ]; then
            MESSAGE="Running tests..."
            # Replacing spaces with commas.
            TESTS=${TESTS// /,}
            JAVA_OPTS="${JAVA_OPTS} -Dfoam.main=testRunnerScript"
            if [ ! -z "${TESTS}" ]; then
                JAVA_OPTS="${JAVA_OPTS} -Dfoam.tests=${TESTS}"
            fi
        fi

        export JAVA_TOOL_OPTIONS="$JAVA_OPTS"
        echo "INFO :: ${JAVA_OPTS}"
        echo "INFO :: ${MESSAGE}..."

        if [ "$TEST" -eq 1 ]; then
            JAVA_OPTS="${JAVA_OPTS} -Dresource.journals.dir=journals"
            JAR=$(ls ${NANOPAY_HOME}/lib/nanopay-*.jar | awk '{print $1}')
            exec java -jar "${JAR}"
        elif [ "$RUNTIME_COMPILE" -eq 1 ]; then
          gradle genJava
          gradle copyLib
          CLASSPATH="$CLASSPATH":foam2/src:build/src/java:nanopay/src
          JAVA_SOURCES="{sources:[\"nanopay/src\",\"foam2/src\",\"build/src/java\"],\"output\":\"build/classes/java/main\"}"
          javac -cp "$CLASSPATH" -d build/classes/java/main foam2/src/foam/nanos/ccl/CCLoader.java
          exec java -cp "$CLASSPATH" -DJAVA_SOURCES=$JAVA_SOURCES -Djava.system.class.loader=foam.nanos.ccl.CCLoader foam.nanos.boot.Boot
        elif [ "$DAEMONIZE" -eq 0 ]; then
            exec java -cp "$CLASSPATH" foam.nanos.boot.Boot
        else
            nohup java -cp "$CLASSPATH" foam.nanos.boot.Boot &> /dev/null &
            echo $! > "$NANOS_PIDFILE"
        fi
    fi
}

function beginswith {
    # https://stackoverflow.com/a/18558871
    case $2 in
      "$1"*)
        true
        ;;
      *)
        false
        ;;
    esac
}

function setup_dirs {
    if [ ! -d "${PROJECT_HOME}/.foam" ]; then
        mkdir -p "${PROJECT_HOME}/.foam"
    fi

    if [ ! -d "$NANOPAY_HOME" ]; then
        mkdir -p "$NANOPAY_HOME"
    fi
    if [ ! -d "${NANOPAY_HOME}/lib" ]; then
        mkdir -p "${NANOPAY_HOME}/lib"
    fi
    if [ ! -d "${NANOPAY_HOME}/bin" ]; then
        mkdir -p "${NANOPAY_HOME}/bin"
    fi
    if [ ! -d "${NANOPAY_HOME}/etc" ]; then
        mkdir -p "${NANOPAY_HOME}/etc"
    fi
    if [ ! -d "${NANOPAY_HOME}/keys" ]; then
        mkdir -p "${NANOPAY_HOME}/keys"
    fi
    if [ ! -d "${LOG_HOME}" ]; then
        mkdir -p "${LOG_HOME}"
    fi
    if [ ! -d "${JOURNAL_HOME}" ]; then
        mkdir -p "${JOURNAL_HOME}"
    fi
    # Remove old symlink to prevent copying into the same folder
    if [ -L "${DOCUMENT_HOME}" ]; then
        rm "$DOCUMENT_HOME"
    fi
    if [ ! -d "${DOCUMENT_HOME}" ]; then
        mkdir -p "${DOCUMENT_HOME}"
    fi
    if [ ! -d "${DOCUMENT_OUT}" ]; then
        mkdir -p "${DOCUMENT_OUT}"
    fi
}

function setenv {
    if [ -z "$NANOPAY_HOME" ]; then
        NANOPAY_ROOT="/opt"
        if [ "$TEST" -eq 1 ]; then
            NANOPAY_ROOT="/tmp"
        fi
        NANOPAY="nanopay"
        if [[ ! -z "$INSTANCE" ]]; then
            NANOPAY="nanopay_${INSTANCE}"
        fi
        export NANOPAY_HOME="$NANOPAY_ROOT/${NANOPAY}"
    fi

    if [ -z "$LOG_HOME" ]; then
        LOG_HOME="$NANOPAY_HOME/logs"
    fi

    local MACOS='darwin*'
    local LINUXOS='linux-gnu'
    IS_MAC=0
    IS_LINUX=0

    if [[ $OSTYPE =~ $MACOS ]]; then
      IS_MAC=1
    elif [[ $OSTYPE =~ $LINUXOS ]]; then
      IS_LINUX=1
    fi

    export PROJECT_HOME="$( cd "$(dirname "$0")" ; pwd -P )"

    export JOURNAL_OUT="$PROJECT_HOME"/target/journals

    export JOURNAL_HOME="$NANOPAY_HOME/journals"

    export DOCUMENT_OUT="$PROJECT_HOME"/target/documents

    export DOCUMENT_HOME="$NANOPAY_HOME/documents"

    export FOAMLINK_DATA="$PROJECT_HOME/.foam/foamlinkoutput.json"

    # Remove $NANOPAY_HOME here and not in setup_dirs step because setup_dirs
    # will be called again right after clean step; however, we need to keep the
    # keystore files generated to $NANOPAY_HOME/var/keys/ directory.
    if [ "$TEST" -eq 1 ]; then
        rm -rf "$NANOPAY_HOME"
    fi
    setup_dirs

    if [[ ! -w $NANOPAY_HOME && $TEST -ne 1 ]]; then
        echo "ERROR :: $NANOPAY_HOME is not writable! Please run 'sudo chown -R $USER /opt' first."
        quit 1
    fi

    PID_FILE="nanos.pid"
    if [[ ! -z "$INSTANCE" ]]; then
        PID_FILE="nanos_${INSTANCE}.pid"
    fi
    export NANOS_PIDFILE="/tmp/${PID_FILE}"

    if beginswith "/pkg/stack/stage" $0 || beginswith "/pkg/stack/stage" $PWD ; then
        PROJECT_HOME=/pkg/stack/stage/NANOPAY
        cd "$PROJECT_HOME"
        cwd=$(pwd)

        # see https://stackoverflow.com/a/22089950
        #npm install npm --ca=""
        # works with Netskope disabled.
        npm install

        CLEAN_BUILD=1
        IS_AWS=1
    fi

    JAVA_OPTS="${JAVA_OPTS} -DNANOPAY_HOME=$NANOPAY_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DJOURNAL_HOME=$JOURNAL_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DDOCUMENT_HOME=$DOCUMENT_HOME"
    JAVA_OPTS="${JAVA_OPTS} -DLOG_HOME=$LOG_HOME"

    # keystore
    if [ "$INSTALL" -eq 1 ] || [ "$TEST" -eq 1 ]; then
        if [[ -f $PROJECT_HOME/tools/keystore.sh ]]; then
            cd "$PROJECT_HOME"
            printf "INFO :: Generating keystore...\n"
            if [[ $TEST -eq 1 ]]; then
                ./tools/keystore.sh -t
            else
                ./tools/keystore.sh
            fi
        fi
    fi

    # HSM setup
    if [[ $IS_MAC -eq 1 ]]; then
      HSM_HOME=$PROJECT_HOME/tools/hsm
      HSM_CONFIG_PATH="${NANOPAY_HOME}/keys/pkcs11.cfg"

      #softhsm setup
      if [[ -f $HSM_HOME/development.sh ]]; then
        printf "INFO :: Setting up SoftHSM...\n"
        $HSM_HOME/development.sh -r $HSM_HOME -d $HSM_CONFIG_PATH
      fi
    fi

    if [[ -z $JAVA_HOME ]]; then
      if [[ $IS_MAC -eq 1 ]]; then
        JAVA_HOME=$($(dirname $(readlink $(which javac)))/java_home)
      elif [[ $IS_LINUX -eq 1 ]]; then
        JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
      fi
    fi

    if [ -z "$MODE" ] || [ "$MODE" == "DEVELOPMENT" ] || [ "$MODE" == "STAGING" ] || [ "$MODE" == "TEST" ]; then
        JAVA_OPTS="-enableassertions ${JAVA_OPTS}"
    fi

    # Check if connected to the interwebs
    ping -q -W1 -c1 google.com &>/dev/null && INTERNET=1 || INTERNET=0
}

function usage {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options are:"
    echo "  -b : Build but don't start nanos."
    echo "  -c : Clean generated code before building.  Required if generated classes have been removed."
    echo "  -d : Run with JDPA debugging enabled on port 8000"
    echo "  -D PORT : JDPA debugging enabled on port PORT."
    echo "  -e : Skipping genJava task."
    echo "  -E EXPLICIT_JOURNALS : "
    echo "  -F <rw | ro> : File System Read-Write (default) or Read-Only"
    echo "  -f : Build foam."
    echo "  -g : Output running/notrunning status of daemonized nanos."
    echo "  -h : Print usage information."
    echo "  -i : Install npm and git hooks"
    echo "  -j : Delete runtime journals, build, and run app as usual."
    echo "  -J JOURNAL_CONFIG : additional journal configuration. See find.sh - deployment/CONFIG i.e. deployment/staging"
    echo "  -k : Package up a deployment tarball."
    echo "  -l : Delete runtime logs."
    echo "  -M MODE: one of DEVELOPMENT, PRODUCTION, STAGING, TEST, DEMO"
    echo "  -m : Run migration scripts."
    echo "  -N NAME : start another instance with given instance name. Deployed to /opt/nanopay_NAME."
    echo "  -o : old maven build"
    echo "  -p : Enable profiling on default port"
    echo "  -P PORT : JProfiler connection on PORT"
    echo "  -r : Start nanos with whatever was last built."
    echo "  -s : Stop a running daemonized nanos."
    echo "  -S : When debugging, start suspended."
    echo "  -t : Run All tests."
    echo "  -T testId1,testId2,... : Run listed tests."
    echo "  -u : Run from jar. Intented for Production deployments."
    echo "  -U : User to run as"
    echo "  -v : java compile only (maven), no code generation."
    echo "  -V VERSION : Updates the project version in POM file to the given version in major.minor.path.hotfix format"
    echo "  -w : Disable liveScriptBundler service. (development only)"
    echo "  -W PORT : HTTP Port. NOTE: WebSocketServer will use PORT+1"
    echo "  -z : Daemonize into the background, will write PID into $PIDFILE environment variable."
    echo "  -x : Check dependencies for known vulnerabilities."
    echo ""
    echo "No options implies: stop, build/compile, deploy, start"
    echo ""
}

# Print Nanopay text (very important, otherwise nothing will work)
if [ $(date +%m) -eq 10 ] && [ $(date +%d) -gt 25 ]; then
  ostart="\033[38;5;214m"
  echo -e " $ostart                                 #'\""
  echo -e "  _ __   __ _ _ __   ___  _ __ @ @ @ @_   _ "
  echo -e " | '_ \\ / _\` | '_ \\ / _ \\| '_@ /\\   /\\ @ | |"
  echo -e " | | | | (_| | | | | (_) | |@     ^     @| |"
  echo -e " |_| |_|\\__,_|_| |_|\\___/| .@  \\_____/  @, |"
  echo -e " (c) nanopay Corporation |_| @ @ @ @ @ @__/\033[0m"
  echo ""
elif [ $(date +%m) -eq 11 ] && [ $(date +%d) -eq 11 ]; then
  echo -e "\033[34;1m  _ __   __ _ _ __   \033[31;1m.-.\033[0m  _ __   __ _ _   _  \033[0m"
  echo -e "\033[34;1m | '_ \\ / _\` | '_ \\\\\033[31;1m.\\   /.\033[0m '_ \\ / _\` | | | | \033[0m"
  echo -e "\033[34;1m | | | | (_| | | |\033[31;1m:\033[0m  (O)  \033[31;1m:\033[0m|_) | (_| | |_| | \033[0m"
  echo -e "\033[34;1m |_| |_|\\__,_|_| |_\033[31;1m'/   \\'\033[0m .__/ \\__,_|\\__, | \033[0m"
  echo -e "\033[34;1m \033[36;1m(c) nanopay Corporation \033[0m\033[0m|_|          |___/  \033[0m"
  echo ""
elif [ $(date +%m) -eq 12 ]; then

 echo -e "                         \033[32m#\033[0m"
 echo -e "                        \033[32m###\033[0m"
 echo -e "\033[38;5;46m _ __   __ _ _ __   ___\033[0m\033[32m##\033[0m\033[33;1;5mO\033[0m\033[32m##\033[0m\033[38;5;46m_   __ _ _   _\033[0m"
 echo -e "\033[38;5;34m| '_ \\ / _\` | '_ \\ / _\033[0m\033[32m#\033[0m\033[31;1;5mO\033[0m\033[32m##\033[0m\033[36;1;5mO\033[0m\033[32m##\033[0m\033[38;5;34m\\ / _\` | | | |\033[0m"
 echo -e "\033[38;5;28m| | | | (_| | | | | (\033[0m\033[32m#\033[0m\033[36;1;5mO\033[0m\033[32m#\033[0m\033[38;5;94m| |\033[0m\033[33;1;5mO\033[0m\033[32m##\033[0m\033[38;5;28m| (_| | |_| |\033[0m"
 echo -e "\033[38;5;22m|_| |_|\\__,_|_| |_|\\\\\033[0m\033[32m##_#\033[0m\033[34;1;5mO\033[0m\033[32m#.#_\033[0m\033[31;1;5mO\033[0m\033[32m#\033[0m\033[38;5;22m\\__,_|\\__, |\033[0m"
 echo -e "\033[33m(c) nanopay Corporation\033[0m \033[38;5;94m|_|\033[0m          \033[38;5;22m|___/\033[0m"
else
  echo -e "\033[34;1m  _ __   __ _ _ __   ___  _ __   __ _ _   _  \033[0m"
  echo -e "\033[34;1m | '_ \\ / _\` | '_ \\ / _ \\| '_ \\ / _\` | | | | \033[0m"
  echo -e "\033[34;1m | | | | (_| | | | | (_) | |_) | (_| | |_| | \033[0m"
  echo -e "\033[34;1m |_| |_|\\__,_|_| |_|\\___/| .__/ \\__,_|\\__, | \033[0m"
  echo -e "\033[34;1m \033[36;1m(c) nanopay Corporation \033[0m\033[34;1m|_|          |___/  \033[0m"
  echo ""
fi

############################

JOURNAL_CONFIG=default
JOURNAL_SPECIFIED=0
INSTANCE=
HOST_NAME=`hostname -s`
VERSION=
MODE=
#MODE=DEVELOPMENT
BUILD_ONLY=0
CLEAN_BUILD=0
DEBUG=0
DEBUG_PORT=8000
DEBUG_SUSPEND=n
EXPLICIT_JOURNALS=
export JAVA_OPTS=
INSTALL=0
PACKAGE=0
PROFILER=0
PROFILER_PORT=8849
RUN_JAR=0
RUN_MIGRATION=0
RESTART_ONLY=0
TEST=0
IS_AWS=0
DAEMONIZE=0
STOP_ONLY=0
RESTART=0
STATUS=0
DELETE_RUNTIME_JOURNALS=0
DELETE_RUNTIME_LOGS=0
COMPILE_ONLY=0
DISABLE_LIVESCRIPTBUNDLER=0
WEB_PORT=8080
VULNERABILITY_CHECK=0
GRADLE_FLAGS=
LIQUID_DEMO=0
RUNTIME_COMPILE=0
RUN_USER=

while getopts "bcdD:E:efghijJ:klmM:N:opP:QrsStT:uU:vV:wW:xz" opt ; do
    case $opt in
        b) BUILD_ONLY=1 ;;
        c) CLEAN_BUILD=1 ;;
        d) DEBUG=1 ;;
        D) DEBUG=1
           DEBUG_PORT=$OPTARG
           ;;
        E) EXPLICIT_JOURNALS="-E"$OPTARG ;;
        e) warning "Skipping genJava task"
           skipGenFlag="-Pfoamoptions.skipgenjava=true"
           if [ "$GRADLE_FLAGS" == "" ]; then
                GRADLE_FLAGS=$skipGenFlag
           else
                GRADLE_FLAGS="$GRADLE_FLAGS $skipGenFlag"
           fi
           ;;
        f) RUNTIME_COMPILE=1;;
        g) STATUS=1 ;;
        h) usage ; quit 0 ;;
        i) INSTALL=1 ;;
        j) DELETE_RUNTIME_JOURNALS=1 ;;
        J) JOURNAL_CONFIG=$OPTARG
           JOURNAL_SPECIFIED=1 ;;
        k) PACKAGE=1
           BUILD_ONLY=1 ;;
        l) DELETE_RUNTIME_LOGS=1 ;;
        m) RUN_MIGRATION=1 ;;
        M) MODE=$OPTARG
           echo "MODE=${MODE}"
           ;;
        N) INSTANCE=$OPTARG
           HOST_NAME=$OPTARG
           echo "INSTANCE=${INSTANCE}" ;;
        p) PROFILER=1 ;;
        P) PROFILER=1
           PROFILER_PORT=$OPTARG ;;
        Q) LIQUID_DEMO=1
           JOURNAL_CONFIG=liquid
           JOURNAL_SPECIFIED=1

           echo ""
           echo -e "\033[34;1m   (                       (     \033[0m"
           echo -e "\033[34;1m   )\ (     (     (   (    )\ )  \033[0m"
           echo -e "\033[34;1m  ((_))\  ( )\   ))\  )\  (()/(  \033[0m"
           echo -e "\033[34;1m   \033[96;1m_\033[0m\033[34;1m ((_) )(( ) /((_)((_)  ((\033[96;1m_\033[0m\033[34;1m)) \033[0m\033[0m"
           echo -e "\033[96;1m  | | \033[34;1m(_)((_)_)(_))(  (_)\033[0m\033[96;1m  _| |  \033[0m"
           echo -e "\033[96;1m  | | | |/ _\` || || | | |/ _\` |  \033[0m"
           echo -e "\033[96;1m  |_| |_|\__, | \_,_| |_|\__,_|  \033[0m"
           echo -e "\033[96;1m            |_|                  \033[0m"
           echo ""
           echo ""
           echo -e "💧 Initializing Liquid Environment 💧"
           echo -e "\033[41;1m IMPORTANT: BE SURE TO SET ENABLED TO TRUE FOR BOTH: \033[0m"
           echo -e "\033[41;1m GenericCIPlanner & GenericFXPlanDAO \033[0m"
           ;;
        r) RESTART_ONLY=1 ;;
        s) STOP_ONLY=1 ;;
        t) TEST=1
           MODE=TEST
           COMPILE_ONLY=0
           ;;
        T) TEST=1
           TESTS=$OPTARG
           MODE=TEST
           ;;
        u) RUN_JAR=1;;
        U) RUN_USER=${OPTARG};;
        v) COMPILE_ONLY=1 ;;
        V) VERSION=$OPTARG
           echo "VERSION=${VERSION}"
           if [ -z "${GRADLE_FLAGS}" ]; then
               GRADLE_FLAGS="-Pversion=${VERSION}"
           else
               GRADLE_FLAGS="${GRADLE_FLAGS} -Pversion=${VERSION}"
           fi
           ;;
        w) DISABLE_LIVESCRIPTBUNDLER=1 ;;
        W) WEB_PORT=$OPTARG
           echo "WEB_PORT=${WEB_PORT}";;
        z) DAEMONIZE=1 ;;
        S) DEBUG_SUSPEND=y ;;
        x) VULNERABILITY_CHECK=1 ;;
       ?) usage ; quit 1 ;;
    esac
done

if [ "${MODE}" == "TEST" ]; then
    if [ $JOURNAL_SPECIFIED -ne 1 ]; then
        echo "INFO :: Mode is TEST, setting JOURNAL_CONFIG to TEST"
        JOURNAL_CONFIG=test
    else
        echo "INFO :: Mode is TEST, but JOURNAL_CONFIG is ${JOURNAL_CONFIG}"
    fi
fi

if [ ${CLEAN_BUILD} -eq 1 ]; then
    GRADLE_FLAGS="${GRADLE_FLAGS} --rerun-tasks"
fi

echo "INFO :: Journal Config is ${JOURNAL_CONFIG}"

############################
# Build steps
############################
setenv

if [[ $INSTALL -eq 1 ]]; then
    install
    quit 0
fi

if [[ $VULNERABILITY_CHECK -eq 1 ]]; then
    echo "INFO :: Checking dependencies for vulnerabilities..."
    gradle dependencyCheckAnalyze --info
    quit 0
fi

if [ "$STATUS" -eq 1 ]; then
    status_nanos
    quit 0
fi

if [ "$RUN_MIGRATION" -eq 1 ]; then
    migrate_journals
    quit 0
fi

stop_nanos
if [ "$STOP_ONLY" -eq 1 ]; then
    quit 0
fi

clean
setup_dirs
deploy_documents
deploy_journals

if [ "${RESTART_ONLY}" -eq 0 ] && [ "${RUNTIME_COMPILE}" -eq 0 ]; then
    build_jar
fi

if [ "${PACKAGE}" -eq 1 ]; then
    package_tar
fi

if [ "${BUILD_ONLY}" -eq 0 ]; then
   start_nanos
fi

quit 0
