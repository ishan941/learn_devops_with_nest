pipeline {
    agent any

    tools {
        nodejs 'NodeJS_14'
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }
        stage('Build Project') {
            steps {
                echo 'Building project...'
                sh 'npm run build'
            }
        }
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh 'npm run test'
            }
        }
    }
    post {
        always {
            echo 'Cleaning up workspace after build'
            cleanWs()
        }
        success {
            echo 'Build succeeded!'
        }
        failure {
            echo 'Build failed!'
        }
    }
}
