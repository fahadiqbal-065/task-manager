pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        DOCKERHUB_USER  = "${DOCKERHUB_CREDS_USR}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USER/taskmanager-frontend:latest ./frontend'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t $DOCKERHUB_USER/taskmanager-backend:latest ./backend'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin'
                sh 'docker push $DOCKERHUB_USER/taskmanager-frontend:latest'
                sh 'docker push $DOCKERHUB_USER/taskmanager-backend:latest'
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker compose -p taskmanager up -d --force-recreate'
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
    }
}
