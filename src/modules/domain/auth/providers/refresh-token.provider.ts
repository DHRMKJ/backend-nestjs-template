import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

export type JwtPayload = {
  accountSessionId: string;
};

type RefreshTokenPayload = {
  sessionId: string;
  refreshKey: string;
};

@Injectable()
export class RefreshTokenProvider {
	private readonly algorithm: string = "aes-256-cbc"
	private readonly key = crypto.randomBytes(32)
	private readonly iv = crypto.randomBytes(16)

	createRefreshToken(payload: RefreshTokenPayload): string {
		const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv)
		return (
			cipher.update(JSON.stringify(payload), "utf8", "hex") +
			cipher.final("hex")
		)
	}

	validateRefreshToken(token: string): RefreshTokenPayload {
		try {
			const decipher = crypto.createDecipheriv(
				this.algorithm,
				this.key,
				this.iv,
			)
			const decrypted =
				decipher.update(token, "hex", "utf8") + decipher.final("utf8")
			return JSON.parse(decrypted)
		} catch (err) {
			throw new UnauthorizedException("Invalid refresh token")
		}
	}
}
