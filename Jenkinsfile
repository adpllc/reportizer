import groovy.json.JsonSlurper

pipeline {
    agent {
        node {
            label 'linux'
            customWorkspace "w\\${JOB_NAME.replace("%2F", "_")}"
        }
    }

    environment {
        ARTIFACTORY_API_KEY   = credentials('JENKINS_ARTIFACTORY_API_KEY')
        HTTP_PROXY            = "http://internal-default-proxy-lb1-19094279.us-east-1.elb.amazonaws.com:3128"
        HTTPS_PROXY           = "http://internal-default-proxy-lb1-19094279.us-east-1.elb.amazonaws.com:3128"
        CI                    = "true"
    }

    options {
        buildDiscarder(logRotator(daysToKeepStr: '7', numToKeepStr: '10'))
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh "npm ci"
            }
        }
        stage('Checks') {
            parallel {
                stage('Unit test') {
                    steps {
                        sh "npm run test:ci"
                    }
                }
                stage('Lint') {
                    steps {
                        sh "npm run lint"
                    }
                }
            }
        }
        stage('Publish') {
            when {
                anyOf {
                    branch "develop"
                    branch "master"
                }
            }

            steps {
                sh "npm publish"
            }
        }
    }
}