import { validatePassword } from "@common/utils"
import { UserEmailService, UserVerificationService } from "@modules/domain/user"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserRegisterV1Response } from "../responses/user-register-v1.response"
import { RegistrationMode } from "@modules/entity"
import { EntityService } from "@modules/entity/entity.service"

@Resolver()
export class EmailAuthMutation {
	constructor(
		private readonly entity: EntityService,
		private readonly emailService: UserEmailService,
		private readonly verificationService: UserVerificationService,
	) {}

	@Mutation(() => UserRegisterV1Response)
	async registerUserWithEmailV1(
		@Args("fullName") fullName: string,
		@Args("password") password: string,
		@Args("email") email: string,
	): Promise<UserRegisterV1Response> {
		validatePassword(password)

		const em = this.entity.getManager()
		const verificationRequest = await em.transaction(async (em) => {
			const user = await this.emailService.createUser(em, {
				fullName,
				password,
				email,
			})
			return await this.verificationService.createUserVerificationRequest(em, {
				user,
				mode: RegistrationMode.Email,
			})
		})

		return new UserRegisterV1Response(verificationRequest)
	}
}
