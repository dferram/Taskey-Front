import { loginHijo, cambiarEstadoAsignacion, cambiarEstadoAsignacionHijo, listarTareasHijo } from '../../services/api';

function mockFetchOnce(body, ok = true, status = ok ? 200 : 400) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('services/api.js - hijo', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('loginHijo posts the code and returns the token payload', async () => {
    const payload = { access_token: 'abc.def.ghi', token_type: 'bearer', child: { id: '1', nombre: 'Juanito' } };
    mockFetchOnce(payload);

    const result = await loginHijo('ABC123XYZ9');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth_hijos/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ codigo: 'ABC123XYZ9' }),
      })
    );
    expect(result).toEqual(payload);
  });

  it('loginHijo throws with the backend detail message on failure', async () => {
    mockFetchOnce({ detail: 'Código inválido o expirado' }, false, 401);

    await expect(loginHijo('wrong')).rejects.toThrow('Código inválido o expirado');
  });

  it('listarTareasHijo calls GET /tareas/mis-tareas with the bearer token', async () => {
    mockFetchOnce([{ id: '1', title: 'Tender la cama', assignments: [] }]);

    const result = await listarTareasHijo('token-123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tareas/mis-tareas'),
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer token-123' },
      })
    );
    expect(result).toHaveLength(1);
  });

  it('cambiarEstadoAsignacionHijo PUTs to the /estado/child endpoint', async () => {
    mockFetchOnce({ id: 'assignment-1', status: 'completed' });

    const result = await cambiarEstadoAsignacionHijo('token-123', 'assignment-1', 'completed');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tareas/asignaciones/assignment-1/estado/child'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' }),
      })
    );
    expect(result.status).toBe('completed');
  });

  it('cambiarEstadoAsignacion (padre) PUTs to the /estado endpoint without /child', async () => {
    mockFetchOnce({ id: 'assignment-1', status: 'verified' });

    const result = await cambiarEstadoAsignacion('token-abc', 'assignment-1', 'verified');

    const [url] = global.fetch.mock.calls[0];
    expect(url).toContain('/tareas/asignaciones/assignment-1/estado');
    expect(url).not.toContain('/estado/child');
    expect(result.status).toBe('verified');
  });

  it('cambiarEstadoAsignacionHijo surfaces backend error messages', async () => {
    mockFetchOnce({ detail: 'El hijo solo puede cambiar a: [...]' }, false, 400);

    await expect(cambiarEstadoAsignacionHijo('token', 'id', 'verified')).rejects.toThrow(
      'El hijo solo puede cambiar a: [...]'
    );
  });
});


it('envía evidencia persistible junto con el estado', async () => {
  const { cambiarEstadoAsignacionHijo } = require('../../services/api');
  mockFetchOnce({ id: 'a1', status: 'completed' });
  await cambiarEstadoAsignacionHijo('token', 'a1', 'completed', 'data:image/jpeg;base64,YWJj');
  const [, options] = global.fetch.mock.calls[0];
  expect(JSON.parse(options.body)).toEqual({ status: 'completed', evidencia_foto: 'data:image/jpeg;base64,YWJj' });
});
