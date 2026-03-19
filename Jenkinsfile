pipeline {
    agent any

    environment {
        APP_NAME = 'node-cicd-app'
        DOCKER_HUB = 'siddhartha536'
        IMAGE = "${DOCKER_HUB}/${APP_NAME}"
        TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out : ${env.GIT_BRANCH}"
                checkout scm
            }
        }

        stage('Install & Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo 'Installing dependencies and running tests...'
                sh 'npm ci'
                sh 'npm test'
            }
            post {
                failure {
                    echo 'Test failed - pipeline stopped. fix test before merging'
                }
            }
        }
        stage('Build Docker Image'){
            steps {
                echo "Building Image : ${IMAGE}:${TAG}"
                sh "docker build -t ${IMAGE}:${TAG} -t${IMAGE}:latest ."
            }
        }
        stage ('Push to Docker Hub'){
            when {
                branch 'main'
            }
            steps {
                echo 'Pushing to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passswordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" || docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${IMAGE}:${TAG}
                        docker push ${IMAGE}:latest
                        docker logout
                    '''
                }
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying....'
                sh '''
                # stop existing container if running
                docker stop ${APP_NAME} || true
                docker rm {APP_NAME} || true

                # Run the newly built image
                docker run -d \
                    --name ${APP_NAME} \
                    -p 3000:3000 \
                    -e NODE_ENV=production
                    -e APP_VERSION=${TAG} \
                    --restart unless-stopped \
                    ${IMAGE}:${TAG}

                echo "App running at http://localhost:3000"
                '''
            }
        }
    }
    post {
        success {
            echo "Build #${BUILD_NUMBER} passed all stages."
        }
        failure {
            echo "Build #${BUILD_NUMBER} failed. Check stage logs above. "
        }
        always {
            // Delete workspace to keep jenkins disk clean
            cleanWs()
        }
    }
}