#!/usr/bin/env groovy

@Library(['adp-jenkins']) _

def config = [emailRecipients: 'mitch.maio@adp.com',
              email: 'ryan.perry@adp.com',
              npmrcId: 'innerspace-npm-settings',
              npmImage: 'dtr.cdl.es.ad.adp.com/innerspace/node-ci:12.13.0',
              gitCredentials: 'ssh-ferris-wheel',
              name: 'Jenkins Build']

def packageJSON

pipeline {
    agent {
        label 'docker'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr:'10'))
        disableConcurrentBuilds()
    }

    stages {

        stage('prepare-git') {
            steps {
                echo "Preparing git with the proper user info..."
                sh "git config user.email ${config.email}"
                sh "git config user.name ${config.name}"

                echo "Cleaning up..."
                sh 'git clean -fdx && git reset --hard'

                script {
                    packageJSON = readJSON file: 'package.json'
                }
            }
        }

        // No matter what, we're going to do a build...
        stage('npm-build') {
            steps {
                echo "Branch is ${env.BRANCH_NAME}..."
                withNpmrc([npmrcId: config.npmrcId, image: config.npmImage]) {
                    sh "npm ci"
                }
            }
        }

        stage('Checks') {
            parallel {
                stage('lint') {
                    steps {
                        echo "Branch is ${env.BRANCH_NAME}..."
                        withNpmrc([npmrcId: config.npmrcId, image: config.npmImage]) {
                            sh "npm run lint"
                        }
                    }
                }

                stage('unit-test') {
                    steps {
                        echo "Branch is ${env.BRANCH_NAME}..."
                        withNpmrc([npmrcId: config.npmrcId, image: config.npmImage]) {
                            sh "npm run test:ci"
                        }
                    }
                }
            }
        }

        // Master branch only accepts builds that are ready for release
        stage('perform-publish') {
            when {
                branch 'master'
            }

            steps {
                withNpmrc([npmrcId: config.npmrcId, image: config.npmImage]) {
                    sh "npm publish"
                }
            }
        }
    }

    post {
        always {
            sendEmail(config.emailRecipients)
        }
    }
}