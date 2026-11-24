import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

async function pseudoErrors(pseudo: string) {
  const errors = await validate(plainToInstance(RegisterDto, { pseudo }));
  return errors.filter((error) => error.property === 'pseudo');
}

describe('RegisterDto', () => {
  it.each(['abc', 'a'.repeat(50), 'a_b.c-d4'])(
    'should accept the pseudo: %p',
    async (pseudo) => {
      expect(await pseudoErrors(pseudo)).toHaveLength(0);
    },
  );

  it.each([
    'ab',
    'a'.repeat(51),
    'email@example.com',
    'pseudo original',
    '<script>',
  ])('should refuse the pseudo: %p', async (pseudo) => {
    expect(await pseudoErrors(pseudo)).toHaveLength(1);
  });
});
