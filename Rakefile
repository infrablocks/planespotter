# frozen_string_literal: true

require 'git'
require 'rake_circle_ci'
require 'rake_docker'
require 'rake_git'
require 'rake_git_crypt'
require 'rake_github'
require 'rake_gpg'
require 'rake_ssh'
require 'rubocop/rake_task'
require 'securerandom'
require 'semantic'
require 'yaml'

def repo
  Git.open('.')
end

def latest_tag
  repo.tags.map do |tag|
    Semantic::Version.new(tag.name.slice(1..))
  end.max
end

task default: %i[
  build:code:fix
  library:lint
  test:unit
]

RakeGitCrypt.define_standard_tasks(
  namespace: :git_crypt,

  provision_secrets_task_name: :'secrets:provision',
  destroy_secrets_task_name: :'secrets:destroy',

  install_commit_task_name: :'git:commit',
  uninstall_commit_task_name: :'git:commit',

  gpg_user_key_paths: %w[
    config/gpg
    config/secrets/ci/gpg.public
  ]
)

namespace :git do
  RakeGit.define_commit_task(
    argument_names: [:message]
  ) do |t, args|
    t.message = args.message
  end
end

namespace :encryption do
  namespace :directory do
    desc 'Ensure CI secrets directory exists.'
    task :ensure do
      FileUtils.mkdir_p('config/secrets/ci')
    end
  end

  namespace :passphrase do
    desc 'Generate encryption passphrase for CI GPG key'
    task generate: ['directory:ensure'] do
      File.write(
        'config/secrets/ci/encryption.passphrase',
        SecureRandom.base64(36)
      )
    end
  end
end

namespace :keys do
  namespace :deploy do
    RakeSSH.define_key_tasks(
      path: 'config/secrets/ci/',
      comment: 'maintainers@infrablocks.io'
    )
  end

  namespace :gpg do
    RakeGPG.define_generate_key_task(
      output_directory: 'config/secrets/ci',
      name_prefix: 'gpg',
      owner_name: 'InfraBlocks Maintainers',
      owner_email: 'maintainers@infrablocks.io',
      owner_comment: 'planespotter CI Key'
    )
  end
end

namespace :secrets do
  namespace :directory do
    desc 'Ensure secrets directory exists and is set up correctly'
    task :ensure do
      FileUtils.mkdir_p('config/secrets')
      unless File.exist?('config/secrets/.unlocked')
        File.write('config/secrets/.unlocked', 'true')
      end
    end
  end

  desc 'Generate all generatable secrets.'
  task generate: %w[
    encryption:passphrase:generate
    keys:deploy:generate
    keys:gpg:generate
  ]

  desc 'Provision all secrets.'
  task provision: [:generate]

  desc 'Delete all secrets.'
  task :destroy do
    rm_rf 'config/secrets'
  end

  desc 'Rotate all secrets.'
  task rotate: [:'git_crypt:reinstall']
end

RuboCop::RakeTask.new

namespace :build do
  namespace :code do
    desc 'Run all checks of the build code'
    task check: [:rubocop]

    desc 'Attempt to automatically fix issues with the build code'
    task fix: [:'rubocop:autocorrect_all']
  end
end

namespace :dependencies do
  desc 'Install library dependencies'
  task :install do
    sh 'npm install'
  end
end

namespace :test do
  desc 'Run unit tests'
  task unit: [:'dependencies:install'] do
    sh 'npm run test'
  end
end

namespace :library do
  desc 'Check for lint issues'
  task lint: [:'dependencies:install'] do
    sh 'npm run lint'
  end

  desc 'Fix lint issues'
  task lintFix: [:'dependencies:install'] do
    sh 'npm run lintFix'
  end
end

RakeCircleCI.define_project_tasks(
  namespace: :circle_ci,
  project_slug: 'github/infrablocks/planespotter'
) do |t|
  circle_ci_config =
    YAML.load_file('config/secrets/circle_ci/config.yaml')

  t.api_token = circle_ci_config['circle_ci_api_token']
  t.environment_variables = {
    ENCRYPTION_PASSPHRASE:
        File.read('config/secrets/ci/encryption.passphrase')
            .chomp
  }
  t.checkout_keys = []
  t.ssh_keys = [
    {
      hostname: 'github.com',
      private_key: File.read('config/secrets/ci/ssh.private')
    }
  ]
end

RakeGithub.define_repository_tasks(
  namespace: :github,
  repository: 'infrablocks/planespotter'
) do |t|
  github_config =
    YAML.load_file('config/secrets/github/config.yaml')

  t.access_token = github_config['github_personal_access_token']
  t.deploy_keys = [
    {
      title: 'CircleCI',
      public_key: File.read('config/secrets/ci/ssh.public')
    }
  ]
end

namespace :pipeline do
  desc 'Prepare CircleCI Pipeline'
  task prepare: %i[
    circle_ci:project:follow
    circle_ci:env_vars:ensure
    circle_ci:checkout_keys:ensure
    circle_ci:ssh_keys:ensure
    github:deploy_keys:ensure
  ]
end

namespace :docker do
  RakeDocker.define_image_tasks(
    image_name: 'planespotter'
  ) do |t|
    t.work_directory = 'docker_build'

    t.copy_spec = ['Dockerfile', 'package.json', 'package-lock.json', 'src']

    t.repository_name = 'planespotter'
    t.repository_url = 'infrablocks/planespotter'

    t.credentials = YAML.load_file(
      'config/secrets/dockerhub/credentials.yaml'
    )

    t.platform = 'linux/amd64'

    t.tags = [latest_tag.to_s, 'latest']
  end
end
