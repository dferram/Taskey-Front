import { render, screen, fireEvent, act, cleanup } from '@testing-library/react-native';
import LoginHijo from '../../app/(auth)/loginhijo';
import { loginHijo } from '../../services/api';
import { AuthRepository } from '../../repositories/AuthRepository';
import { router, __resetMocks } from 'expo-router';

jest.mock('../../services/api');

describe('<LoginHijo />', () => {
  beforeEach(async () => {
    __resetMocks();
    await AuthRepository.clearAll();
  });

  afterEach(async () => {
    await cleanup();
  });

  it('guarda el token y los datos del hijo usando el mismo storage que lee AuthRepository', async () => {
    loginHijo.mockResolvedValue({
      access_token: 'jwt-del-hijo',
      token_type: 'bearer',
      child: { id: 'child-1', nombre: 'Juanito' },
    });

    await render(<LoginHijo />);

    await act(async () => {
      await fireEvent.changeText(screen.getByPlaceholderText('Código'), 'ABC123XYZ9');
    });

    await act(async () => {
      await fireEvent.press(screen.getByTestId('loginHijoButton'));
    });

    expect(loginHijo).toHaveBeenCalledWith('ABC123XYZ9');

    // Esta es la regresion real que se arreglo: antes se guardaba con
    // AsyncStorage.setItem crudo y AuthRepository.getChildToken() siempre
    // devolvia null porque esperaba JSON.
    const token = await AuthRepository.getChildToken();
    const data = await AuthRepository.getChildData();

    expect(token).toBe('jwt-del-hijo');
    expect(data).toEqual({ id: 'child-1', nombre: 'Juanito' });
    expect(router.replace).toHaveBeenCalledWith('/perfilhijo');
  });

  it('permite escribir codigos alfanumericos de hasta 10 caracteres', async () => {
    await render(<LoginHijo />);

    const input = screen.getByPlaceholderText('Código');
    expect(input.props.keyboardType).not.toBe('numeric');
    expect(input.props.maxLength).toBe(10);
  });
});
