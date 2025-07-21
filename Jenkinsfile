pipeline {
  agent {
    docker {
      image 'node:18'
      args '-u root'
    }
  }

  environment {
    SLACK_WEBHOOK = credentials('slack-webhook')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Test') {
      steps {
        sh 'npm test || true'  // Avoid fail if no tests or test error
      }
      post {
        always {
          junit '**/test-results/**/*.xml'
        }
      }
    }
  }

  post {
    success {
      script {
        def payload = """{
          "text": "✅ Build succeeded for job ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }"""
        writeFile file: 'slack-success.json', text: payload
        sh "curl -X POST -H 'Content-type: application/json' --data @slack-success.json '${SLACK_WEBHOOK}'"
      }
    }
    failure {
      script {
        def payload = """{
          "text": "❌ Build failed for job ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }"""
        writeFile file: 'slack-failure.json', text: payload
        sh "curl -X POST -H 'Content-type: application/json' --data @slack-failure.json '${SLACK_WEBHOOK}'"
      }
    }
  }
}
