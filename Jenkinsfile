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

        // After release, prepare for the next release by checking out the develop branch
        // and updating the package.json for the next release
        stage('prepare-for-next-release') {

            when {
                branch 'master'
            }

            steps {
                echo "Preparing for next release"

                script {
                    sshagent([config.gitCredentials]) {
                        sh 'git fetch origin +refs/heads/develop:refs/remotes/origin/develop'
                        sh 'git pull origin develop'
                        sh 'git checkout origin/develop'
                    }

                    withNpmrc([npmrcId: config.npmrcId, image: config.npmImage]) {
                        sh 'npm version --no-git-tag-version patch'
                    }

                    sshagent([config.gitCredentials]) {
                        sh 'git add package.json'

                        packageJSON = readJSON file: './package.json'

                        sh "git commit -m \"Preparing next release to be ${packageJSON.version}.\""
                        sh 'git push origin HEAD:refs/heads/develop'

                    }
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