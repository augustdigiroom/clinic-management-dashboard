export type ApiMode = 'portfolio' | 'demo'

export interface ApiEnvironmentConfig {
  readonly baseUrl: string
  readonly readOnly: boolean
}

export const apiEnvironments: Readonly<Record<ApiMode, ApiEnvironmentConfig>> = {
  portfolio: {
    baseUrl: 'https://clinic-api-portfolio.onrender.com',
    readOnly: true,
  },
  demo: {
    baseUrl: 'https://clinic-api-demo-6tbw.onrender.com',
    readOnly: false,
  },
}
