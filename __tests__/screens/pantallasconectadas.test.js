import { render, screen, fireEvent } from '@testing-library/react-native';
import Recompensas from '../../app/(child)/recompensashijo';
import Logros from '../../app/(child)/logroshijo';
import Avatar from '../../app/(child)/personalizaravatar';
import AsignarTarea from '../../app/(parent)/asignartarea';
import { useBackendResource } from '../../hooks/useBackendResource';
import { useTareasViewModel } from '../../viewmodels/useTareasViewModel';
import { AuthRepository } from '../../repositories/AuthRepository';
import { guardarAvatar } from '../../services/api';
import { __setParams, __resetMocks } from 'expo-router';

jest.mock('../../hooks/useBackendResource');
jest.mock('../../viewmodels/useTareasViewModel');
jest.mock('../../repositories/AuthRepository');
jest.mock('../../services/api');
const loaded = data => ({ data, loading: false, error: null, reload: jest.fn() });
beforeEach(() => { jest.clearAllMocks(); __resetMocks(); });
it('muestra saldo e historial del servidor, sin premios inventados', async () => {
  useBackendResource.mockReturnValue(loaded({ llaves: 7, minutos: 12, historial: [{ id: 'real', title: 'Mi misión real', keys: 7, minutes: 12 }] }));
  await render(<Recompensas />);
  expect(screen.getByText('7 llaves')).toBeTruthy();
  expect(screen.getByText('Mi misión real')).toBeTruthy();
  expect(screen.queryByText('160')).toBeNull();
  expect(screen.queryByText('Tender cama')).toBeNull();
});
it('un error no se presenta como historial vacío', async () => {
  const reload = jest.fn();
  useBackendResource.mockReturnValue({ data: null, loading: false, error: 'Servidor no disponible', reload });
  await render(<Recompensas />);
  expect(screen.getByText('Servidor no disponible')).toBeTruthy();
  await fireEvent.press(screen.getByText('Reintentar'));
  expect(reload).toHaveBeenCalled();
});
it('separa logros obtenidos y pendientes según la API', async () => {
  useBackendResource.mockReturnValue(loaded([
    { id: '1', title: 'Primera misión', description: 'Aprobada', obtenido: true, actual: 1, objetivo: 1 },
    { id: '2', title: 'Constancia', description: 'Tres días', obtenido: false, actual: 1, objetivo: 3 },
  ]));
  await render(<Logros />);
  expect(screen.getByText('Primera misión')).toBeTruthy();
  expect(screen.queryByText('Constancia')).toBeNull();
  await fireEvent.press(screen.getByText('Por cumplir'));
  expect(screen.getByText('Constancia')).toBeTruthy();
});
it('guarda el avatar seleccionado en el backend y vuelve a consultar', async () => {
  const result = loaded({ perfil: { avatar_id: 'capicons', llaves_disponibles: 7 }, catalogo: [{ id: 'capifer', nombre: 'Capi explorador' }] });
  useBackendResource.mockReturnValue(result);
  AuthRepository.getChildToken.mockResolvedValue('child-token');
  guardarAvatar.mockResolvedValue({ avatar_id: 'capifer' });
  await render(<Avatar />);
  await fireEvent.press(screen.getByLabelText('Elegir Capi explorador'));
  expect(guardarAvatar).toHaveBeenCalledWith('child-token', 'capifer');
  expect(result.reload).toHaveBeenCalled();
});
it('asigna al hijo seleccionado una tarea del servidor', async () => {
  __setParams({ id: 'child-1' });
  useBackendResource.mockReturnValue(loaded({ id: 'child-1', nombre: 'Hijo real' }));
  const asignarTarea = jest.fn().mockResolvedValue({ success: true });
  useTareasViewModel.mockReturnValue({ tareas: [{ id: 'task-1', title: 'Misión del servidor', assignments: [] }], loading: false, fetchTareas: jest.fn(), asignarTarea });
  await render(<AsignarTarea />);
  expect(screen.getByText('Misión del servidor')).toBeTruthy();
  expect(screen.queryByText('Pasear a Toby')).toBeNull();
  await fireEvent.press(screen.getByText('Asignar'));
  expect(asignarTarea).toHaveBeenCalledWith('task-1', 'child-1');
});
