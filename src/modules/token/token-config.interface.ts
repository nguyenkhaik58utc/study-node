import { Injectable } from "@nestjs/common";

export interface TokenConfig {
  apiKey: string;
  secret: string;
}

@Injectable()
export class SandboxTokenConfigService implements TokenConfig {
  apiKey = 'sandbox-key-123';
  secret = 'sandbox-secret-xyz';
}

@Injectable()
export class ProdTokenConfigService implements TokenConfig {
  apiKey = 'prod-key-abc';
  secret = 'prod-secret-789';
}