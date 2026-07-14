import { Profile } from '../entities/Profile';

export interface IProfileRepository {
  getProfile(): Promise<Profile | null>;
  updateNome(nome: string): Promise<void>;
  updateAvatar(avatarUrl: string): Promise<void>;
  deleteAccount(): Promise<void>;
}
