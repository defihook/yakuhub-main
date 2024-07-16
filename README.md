# Yaku Hub

Yaku Hub is the umbrella agency for the popular NFT project 'Yaku' - We provide the backend service to multiple projects in need of a great utility, as well as offering staking as a service products.

# Getting Started

0. env

    - Node 16.17 LTS
    - Mongo DB 3+

1. Installation process
    - install vercel in your global node_modules
    - install mongodb and make sure you launch it
    - run 'npm ci' to clean install the project node_modules
    - start dev server run 'npm run start:dev'
    - login to your personal vercel account to config the build config by using npm run build, npm ci and npm run start

## For Developers

1. Please branch out from main if you are going to develop new features or doing production fix
2. Please create pull request or ask DevOps to merge your branch to dev-preview for deploying to SIT environment
3. Please request teams approval for any fixes or features that required to deploy to main branch for production
4. Please create your own vercel account for local development and local testing
5. If you need any API key, please ask for Sensei or Dev Lead approval
6. Please commit your code frequently, to save works, to avoid too many conflicts when merging to dev-preview, and to avoid Sensei think you are sleeping XD.
7. If you need to install any new libraries or packages, please check clearly it is not with AGPL license. And please commit the package-lock.json also, since deployment requires it to do clean install.
