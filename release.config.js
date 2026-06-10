export default {
  // extends: "semantic-release-monorepo",
  branches: ['release', { name: 'main', prerelease: 'rc' }, { name: "next", prerelease: "rc-next" }, { name: 'develop/v3', prerelease: 'rc3' }],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'release', "scope": 'major',  release: 'major' },
          { type: 'release', "scope": 'minor',  release: 'minor' },
          { type: 'release', "scope": 'patch',  release: 'patch' },
          // '!'/BREAKING CHANGE markers are capped at minor: major releases are
          // only ever cut explicitly via a release(major) commit.
          { breaking: true, release: 'minor' },
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
    // ['@semantic-release/exec', { publishCmd: 'echo "::set-output name=release_version::${nextRelease.version}"' }],
  ],
}
