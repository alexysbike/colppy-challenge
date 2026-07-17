export abstract class TokenManager {
  abstract retrieve(name: string): Promise<string | undefined | null | void>
  abstract clean(name: string): Promise<boolean | void | null | undefined>
  abstract cleanAll(): Promise<boolean | void | null | undefined>
  abstract persist(name: string, token: string): Promise<string | boolean | undefined | null | void>
}
