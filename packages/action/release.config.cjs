module.exports = {
  extends: ["semantic-release-monorepo"],
  branches: ['release', { name: 'main', prerelease: 'rc' }, { name: "v3", prerelease: 'rc' }],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'release', "scope": 'major',  release: 'major' },
          { type: 'release', "scope": 'minor',  release: 'minor' },
          { type: 'release', "scope": 'patch',  release: 'patch' },
          { type: 'chore', release: 'patch' },
          { type: 'refactor', release: 'patch' },
        ],
      },
    ],
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits',
      presetConfig: {
        types: [
          { type: 'feat', section: 'Features' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'chore', section: 'Internal', hidden: false },
          { type: 'refactor', section: 'Internal', hidden: false },
        ]},
    }],
    [
      '@semantic-release/github',
      {
        successComment: false,
        labels: false,
      },
    ],
  ],
}
