import antfu from '@antfu/eslint-config';

export function createConfig(
) {
  return antfu({
    ignores: ['**/dist/**/*', '**/lib/**/*', '**/vendor/**/*', '**/public/**/*', '**/*.d.ts'],
    stylistic: {
      semi: true,
    },
    javascript: {
      overrides: {
        'array-callback-return': 'error',
        'no-await-in-loop': 'error',
        'no-constant-binary-expression': 'error',
        'no-constructor-return': 'error',
        'no-duplicate-imports': 'error',
        'no-new-native-nonconstructor': 'error',
        'no-promise-executor-return': 'error',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-unreachable-loop': 'error',
        'no-unused-private-class-members': 'error',
        'no-use-before-define': 'error',
        'require-atomic-updates': 'error',
        'arrow-body-style': ['error', 'as-needed'],
        'no-else-return': ['error', { allowElseIf: false }],
        'no-multi-assign': 'error',
        'no-multi-str': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-new-object': 'error',
        'no-new-wrappers': 'error',
        'no-octal-escape': 'error',
        'no-param-reassign': 'error',
        'no-proto': 'error',
        'no-return-assign': 'error',
        'no-return-await': 'error',
        'no-script-url': 'error',
        'no-sequences': 'error',
        'no-shadow': 'error',
        'no-unneeded-ternary': 'error',
        'no-unused-expressions': 'error',
        'no-useless-call': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-concat': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'no-var': 'error',
        'no-void': 'error',
        'object-shorthand': 'error',
        'one-var': ['error', 'never'],
        'one-var-declaration-per-line': 'error',
        'operator-assignment': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-const': 'error',
        'prefer-destructuring': 'error',
        'prefer-exponentiation-operator': 'error',
        'prefer-named-capture-group': 'error',
        'prefer-numeric-literals': 'error',
        'prefer-object-has-own': 'error',
        'prefer-object-spread': 'error',
        'prefer-promise-reject-errors': 'error',
        'prefer-regex-literals': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'quote-props': ['error', 'as-needed'],
        'unicorn/no-null': 'off',
        'unicorn/no-unsafe-regex': 'error',
        'unicorn/no-unused-properties': 'error',
        'unicorn/prefer-at': 'error',
        'unicorn/prefer-event-target': 'error',
        'unicorn/prefer-json-parse-buffer': 'error',
        'unicorn/prefer-string-replace-all': 'error',
        'unicorn/require-post-message-target-origin': 'error',
        'unicorn/prefer-array-some': 'error',
        'unicorn/prefer-array-find': 'error',
        'unicorn/prefer-array-flat-map': 'error',
        'unicorn/prefer-array-index-of': 'error',
        'unicorn/prefer-export-from': 'error',
        'unicorn/numeric-separators-style': [
          'error',
          {
            onlyIfContainsSeparator: true,
            number: {
              onlyIfContainsSeparator: false,
            },
          },
        ],
      },
    },
    typescript: {
      parserOptions: {
        project: `${import.meta.dirname}/../../tsconfig.eslint.json`,
      },
      overrides: {
        'ts/strict-boolean-expressions': 'off',
      },
    },
  }, {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'style/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      }],
      'ts/no-unused-vars': 'error',
      'ts/array-type': ['error', { default: 'generic' }],
      'ts/consistent-type-definitions': 'off',
      'ts/consistent-type-exports': 'error',
      'ts/strict-boolean-expressions': 'off',
      'ts/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      'ts/explicit-function-return-type': 'error',
      'ts/explicit-member-accessibility': 'error',
      'ts/explicit-module-boundary-types': 'error',
      'ts/member-ordering': 'error',
      'ts/method-signature-style': ['error', 'method'],
      'ts/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['strictCamelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: ['typeLike', 'enumMember'],
          format: ['StrictPascalCase'],
          custom: {
            regex: '^[A-Z]{2}',
            match: false,
          },
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'objectLiteralProperty',
          format: [],
          filter: {
            regex: '^--',
            match: true,
          },
        },
      ],
      'ts/no-confusing-void-expression': 'error',
      'ts/no-magic-numbers': 'off',
      'ts/no-redundant-type-constituents': 'error',
      'ts/no-require-imports': 'error',
      'ts/no-shadow': 'error',
      'ts/no-unnecessary-qualifier': 'error',
      'ts/parameter-properties': [
        'error',
        {
          prefer: 'parameter-property',
        },
      ],
      'ts/prefer-enum-initializers': 'error',
      'ts/prefer-readonly': 'error',
      'ts/prefer-regexp-exec': 'error',
      'ts/require-array-sort-compare': 'error',
      'ts/switch-exhaustiveness-check': 'error',
    },
  });
}
