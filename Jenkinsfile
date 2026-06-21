/**
 * Wanderlust CI Pipeline (Wanderlust-CI)
 *
 * Shared library: https://github.com/Santosh-Pathak/jenkins-shared-libraries
 * Jenkins → Manage Jenkins → System → Global Pipeline Libraries
 *   Name: Shared | Repository: jenkins-shared-libraries | Default version: main
 *
 * Agent label: Node
 * Credentials: dockerhub-cred, Github-cred, SonarQube server + token
 */
@Library('Shared') _

pipeline {
    agent { label 'Node' }

    environment {
        DOCKERHUB_USER = 'santoshpathak456'
        GIT_REPO = 'https://github.com/Santosh-Pathak/WanderLust.git'
        GIT_BRANCH = 'main'
    }

    parameters {
        string(name: 'FRONTEND_DOCKER_TAG', defaultValue: '', description: 'Frontend Docker image tag (e.g. v1.0.0)')
        string(name: 'BACKEND_DOCKER_TAG', defaultValue: '', description: 'Backend Docker image tag (e.g. v1.0.0)')
    }

    stages {
        stage('Validate Parameters') {
            steps {
                script {
                    if (!params.FRONTEND_DOCKER_TAG?.trim() || !params.BACKEND_DOCKER_TAG?.trim()) {
                        error 'FRONTEND_DOCKER_TAG and BACKEND_DOCKER_TAG must be provided.'
                    }
                }
            }
        }

        stage('Workspace cleanup') {
            steps {
                script {
                    clean_ws()
                }
            }
        }

        stage('Git: Code Checkout') {
            steps {
                script {
                    clone("${env.GIT_REPO}", "${env.GIT_BRANCH}")
                }
            }
        }

        stage('Trivy: Filesystem scan') {
            steps {
                script {
                    trivy_scan()
                }
            }
        }

        stage('OWASP: Dependency check') {
            steps {
                dependencyCheck additionalArguments: '''
                    --scan ./backend
                    --scan ./frontend
                    --format ALL
                ''', odcInstallation: 'DP-Check'
                dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
            }
        }

        stage('SonarQube: Code Analysis') {
            steps {
                withSonarQubeEnv('Sonar') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=wanderlust \
                          -Dsonar.projectName=wanderlust \
                          -Dsonar.sources=backend,frontend/src \
                          -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
                    """
                }
            }
        }

        stage('SonarQube: Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate(abortPipeline: true)
                }
            }
        }

        stage('Exporting environment variables') {
            parallel {
                stage('Backend env setup') {
                    steps {
                        dir('Automations') {
                            sh 'bash updatebackendnew.sh'
                        }
                    }
                }
                stage('Frontend env setup') {
                    steps {
                        dir('Automations') {
                            sh 'bash updatefrontendnew.sh'
                        }
                    }
                }
            }
        }

        stage('Docker: Build Images') {
            steps {
                script {
                    dir('backend') {
                        docker_build(
                            imageName: "${env.DOCKERHUB_USER}/wanderlust-backend-beta",
                            imageTag: "${params.BACKEND_DOCKER_TAG}"
                        )
                    }
                    dir('frontend') {
                        docker_build(
                            imageName: "${env.DOCKERHUB_USER}/wanderlust-frontend-beta",
                            imageTag: "${params.FRONTEND_DOCKER_TAG}"
                        )
                    }
                }
            }
        }

        stage('Docker: Push to DockerHub') {
            steps {
                script {
                    docker_push(
                        imageName: "${env.DOCKERHUB_USER}/wanderlust-backend-beta",
                        imageTag: "${params.BACKEND_DOCKER_TAG}",
                        credentials: 'dockerhub-cred'
                    )
                    docker_push(
                        imageName: "${env.DOCKERHUB_USER}/wanderlust-frontend-beta",
                        imageTag: "${params.FRONTEND_DOCKER_TAG}",
                        credentials: 'dockerhub-cred'
                    )
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: '**/dependency-check-report.*', allowEmptyArchive: true
            build job: 'Wanderlust-CD', wait: false, parameters: [
                string(name: 'FRONTEND_DOCKER_TAG', value: "${params.FRONTEND_DOCKER_TAG}"),
                string(name: 'BACKEND_DOCKER_TAG', value: "${params.BACKEND_DOCKER_TAG}")
            ]
        }
        failure {
            echo 'CI pipeline failed — fix security/quality issues before redeploying.'
        }
    }
}
