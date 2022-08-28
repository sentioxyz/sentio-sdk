module.exports = {
  // branches: ['release', { name: 'main', prerelease: 'rc' }],
  branches: ['main'],
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
    // "@semantic-release/changelog",
    "@semantic-release/npm",
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/github',
      {
        successComment: false,
        labels: false,
      },
    ],
    // ['@semantic-release/exec', { publishCmd: 'echo "::set-output name=release_version::${nextRelease.version}"' }],
  ],
}
