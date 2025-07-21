pipeline {
  agent {
    docker {
      image 'node:18'
      args '-u root'
    }
  }

  environment {
    BRANCH_NAME = "${env.GIT_BRANCH ?: env.BRANCH_NAME}"
    NODE_CACHE = '/root/.npm'
    SLACK_WEBHOOK = credentials('slack-webhook')
    GITHUB_TOKEN = credentials('github-token')
    REPO = 'ishan941/learn_devops_with_nest' // ⚠️ just org/repo, not full URL
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        dir('learnnest-student-crud') {
          sh 'npm ci'
        }
      }
    }

    stage('Lint') {
      when {
        anyOf { branch 'main'; changeRequest() }
      }
      steps {
        dir('learnnest-student-crud') {
          sh 'npm run lint || true'
        }
      }
    }

    stage('Test') {
      when {
        anyOf { branch 'main'; changeRequest() }
      }
      steps {
        dir('learnnest-student-crud') {
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
        anyOf { branch 'main'; changeRequest() }
      }
      steps {
        dir('learnnest-student-crud') {
          sh 'npm run build'
        }
        archiveArtifacts artifacts: 'learnnest-student-crud/dist/**', fingerprint: true
      }
    }

 stage('Auto Merge PR') {
  when {
    allOf {
      changeRequest(target: 'main')
      expression { currentBuild.currentResult == 'SUCCESS' }
    }
  }
  steps {
    script {
      echo "🔁 CHANGE_ID = ${env.CHANGE_ID}"
      echo "🔁 REPO = ${REPO}"

      def mergePayload = """{
        "commit_title": "✅ Auto-merged by Jenkins",
        "merge_method": "merge"
      }"""

      def response = sh(
        script: """
          curl -s -w "\\n%{http_code}" -X PUT \
          -H "Authorization: token ${GITHUB_TOKEN}" \
          -H "Accept: application/vnd.github.v3+json" \
          -d '${mergePayload}' \
          https://api.github.com/repos/${REPO}/pulls/${CHANGE_ID}/merge
        """,
        returnStdout: true
      ).trim()

      def (body, statusCode) = response.split('\n')
      echo "GitHub API response code: ${statusCode}"
      echo "GitHub API response body: ${body}"

      if (statusCode != '200') {
        error("❌ Auto-merge failed with status ${statusCode}")
      } else {
        echo "✅ Auto-merge successful"
      }
    }
  }
}

  }

  post {
    success {
      script {
        def author = sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
        def message = sh(script: "git log -1 --pretty=%B", returnStdout: true).trim()
        def time = sh(script: "date '+%Y-%m-%d %H:%M:%S'", returnStdout: true).trim()

        def payload = """
        {
          "text": "✅ *Build Succeeded*",
          "attachments": [
            {
              "color": "good",
              "fields": [
                { "title": "Job", "value": "${env.JOB_NAME}", "short": true },
                { "title": "Build", "value": "#${env.BUILD_NUMBER}", "short": true },
                { "title": "Branch", "value": "${env.BRANCH_NAME}", "short": true },
                { "title": "Commit Author", "value": "${author}", "short": true },
                { "title": "Commit Message", "value": "${message}", "short": false },
                { "title": "Time", "value": "${time}", "short": true },
                { "title": "View Logs", "value": "<${env.BUILD_URL}|Click to View>", "short": false }
              ]
            }
          ]
        }
        """
        writeFile file: 'slack-success.json', text: payload
        sh "curl -X POST -H 'Content-type: application/json' --data @slack-success.json '${SLACK_WEBHOOK}'"
      }
    }

    failure {
      script {
        def time = sh(script: "date '+%Y-%m-%d %H:%M:%S'", returnStdout: true).trim()
        def payload = """
        {
          "text": "❌ *Build Failed*",
          "attachments": [
            {
              "color": "danger",
              "fields": [
                { "title": "Job", "value": "${env.JOB_NAME}", "short": true },
                { "title": "Build", "value": "#${env.BUILD_NUMBER}", "short": true },
                { "title": "Branch", "value": "${env.BRANCH_NAME}", "short": true },
                { "title": "Time", "value": "${time}", "short": true },
                { "title": "View Logs", "value": "<${env.BUILD_URL}|Click to View>", "short": false }
              ]
            }
          ]
        }
        """
        writeFile file: 'slack-failure.json', text: payload
        sh "curl -X POST -H 'Content-type: application/json' --data @slack-failure.json '${SLACK_WEBHOOK}'"
      }
    }
  }
}
