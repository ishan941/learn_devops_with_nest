pipeline {
  agent {
    docker {
      image 'node:18'
      args '-u root'  // run as root to avoid permission issues
    }
  }

  environment {
    BRANCH_NAME = "${env.GIT_BRANCH ?: env.BRANCH_NAME}"  // fallback for branch
    NODE_CACHE = '/root/.npm'  // npm cache
    SLACK_WEBHOOK = credentials('slack-webhook') 
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timestamps()
  }

  stages {

    stage('Install') {
      steps {
        dir("${env.WORKSPACE}") {
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
        sh 'npm run lint || true'
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
        sh 'npm run test -- --passWithNoTests'
      }
      post {
        always {
          junit '**/test-results/**/*.xml'
        }
      }
    }

    stage('Build') {
      when {
        branch 'main'
      }
      steps {
        sh 'npm run build'
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        echo '🚀 Deploying to production server...'
        // Add your deploy script here
      }
    }
  }

  post {
    success {
      script {
        sh """
          curl -X POST -H 'Content-type: application/json' \
          --data '{"text": "✅ *Build Succeeded* on branch `${env.BRANCH_NAME}`\\n🔗 <${env.BUILD_URL}|View Build Log>"}' \
          ${SLACK_WEBHOOK}
        """
      }
    }
    failure {
      script {
        sh (
        script: "curl -X POST -H 'Content-type: application/json' --data '{\"text\": \"❌ *Build Failed* on branch \\`${env.BRANCH_NAME}\\`\\n🔗         <${env.BUILD_URL}|View Build Log>\"}' ${SLACK_WEBHOOK}",
        returnStdout: true
        )

      }
    }
  }
}
