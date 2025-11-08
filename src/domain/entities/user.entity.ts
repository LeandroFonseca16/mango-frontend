/**
 * Entidade User do domínio - MangoBeat AI
 * Representa um usuário do sistema
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly name?: string,
    public readonly avatar?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Verifica se o usuário tem um avatar configurado
   */
  hasAvatar(): boolean {
    return !!this.avatar;
  }

  /**
   * Retorna o nome para exibição (name ou email se name não existir)
   */
  getDisplayName(): string {
    return this.name || this.email;
  }

  /**
   * Cria uma nova instância sem dados sensíveis
   */
  toPublic(): Omit<User, 'password'> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    } as Omit<User, 'password'>;
  }
}