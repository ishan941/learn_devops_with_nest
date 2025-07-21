pipeline {
  agent {
    docker {
      image 'node:18'
      args '-u root'  // run as root to avoid permission issues
    }
  }

  environment {
    BRANCH_NAME = "${env.GIT_BRANCH ?: env.BRANCH_NAME}"
    NODE_CACHE = '/root/.npm'
    SLACK_WEBHOOK = credentials('slack-webhook')
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timestamps()
  }

  stages {
    stage('Install') {
      steps {
        dir("${env.WORKSPACE}/learnnest-student-crud") {
          sh 'npm ci'
        }
      }
    }

    stage('Lint') {
      when {
        anyOf {
          branch 'develop'
          branch 'main'
        }
      }
      steps {
        dir("${env.WORKSPACE}/learnnest-student-crud") {
          sh 'npm run lint || true'
        }
      }
    }

    stage('Test') {
      when {
        anyOf {
          branch 'develop'
          branch 'main'
        }
      }
      steps {
        dir("${env.WORKSPACE}/learnnest-student-crud") {
          sh 'npm run test -- --passWithNoTests'
        }
      }
      post {
        always {
          junit 'learnnest-student-crud/test-results/**/*.xml'
        }
      }
    }

    stage('Build') {
      when {
        branch 'main'
      }
      steps {
        dir("${env.WORKSPACE}/learnnest-student-crud") {
          sh 'npm run build'
        }
        archiveArtifacts artifacts: 'learnnest-student-crud/dist/**', fingerprint: true
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        echo '🚀 Deploying to production server...'
        // Add deploy logic here
      }
    }
  }

 post {
  success {
    script {
      def timestamp = new Date().format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("Asia/Kathmandu"))
      def gitCommitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
      def gitAuthor = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
      def branchName = env.BRANCH_NAME

      def slackPayload = [
        text: "✅ *Build Succeeded*",
        attachments: [[
          color : "good",
          fields: [
            [ title: "Job", value: env.JOB_NAME, short: true ],
            [ title: "Build", value: "#${env.BUILD_NUMBER}", short: true ],
            [ title: "Branch", value: "`$branchName`", short: true ],
            [ title: "Commit Author", value: gitAuthor, short: true ],
            [ title: "Commit Message", value: gitCommitMessage, short: false ],
            [ title: "Time", value: timestamp, short: true ],
            [ title: "View Logs", value: "<${env.BUILD_URL}|Click to View>", short: false ]
          ]
        ]]
      ]

      writeJSON file: 'slack-success.json', json: slackPayload
      sh "curl -X POST -H 'Content-type: application/json' --data @slack-success.json ${SLACK_WEBHOOK}"
    }
  }

  failure {
    script {
      def timestamp = new Date().format("yyyy-MM-dd HH:mm:ss", TimeZone.getTimeZone("Asia/Kathmandu"))
      def gitCommitMessage = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
      def gitAuthor = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
      def branchName = env.BRANCH_NAME

      def slackPayload = [
        text: "❌ *Build Failed*",
        attachments: [[
          color : "danger",
          fields: [
            [ title: "Job", value: env.JOB_NAME, short: true ],
            [ title: "Build", value: "#${env.BUILD_NUMBER}", short: true ],
            [ title: "Branch", value: "`$branchName`", short: true ],
            [ title: "Commit Author", value: gitAuthor, short: true ],
            [ title: "Commit Message", value: gitCommitMessage, short: false ],
            [ title: "Time", value: timestamp, short: true ],
            [ title: "View Logs", value: "<${env.BUILD_URL}|Click to View>", short: false ]
          ]
        ]]
      ]

      writeJSON file: 'slack-failure.json', json: slackPayload
      sh "curl -X POST -H 'Content-type: application/json' --data @slack-failure.json ${SLACK_WEBHOOK}"
    }
  }
}

}
