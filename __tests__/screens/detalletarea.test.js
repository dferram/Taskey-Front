import { render, screen, fireEvent } from '@testing-library/react-native';
import DetalleTarea from '../../app/(child)/detalletarea';
import { useTareasHijoViewModel } from '../../viewmodels/useTareasHijoViewModel';
import { useBackendResource } from '../../hooks/useBackendResource';
import { saveEvidenceDraft, removeEvidenceDraft } from '../../storage/evidenceDraft';
import { __setParams, __resetMocks } from 'expo-router';

jest.mock('../../viewmodels/useTareasHijoViewModel');
jest.mock('../../hooks/useBackendResource');
const photo = 'data:image/jpeg;base64,YWJj';
const resource = status => ({ data: { tarea: { title: 'Tarea real', reward_keys: 25 }, asignacion: { id: 'a1', status } }, reload: jest.fn(), loading: false, error: null });
beforeEach(() => {
  __resetMocks(); __setParams({ id: 'a1', title: 'Dato viejo' });
  removeEvidenceDraft('a1');
  useBackendResource.mockReturnValue(resource('in_progress'));
  useTareasHijoViewModel.mockReturnValue({ cambiarEstado: jest.fn().mockResolvedValue({ success: true }) });
});
it('lee el título del backend y desactiva envío sin foto', async () => {
  await render(<DetalleTarea />);
  expect(screen.getByText('Tarea real')).toBeTruthy();
  expect(screen.queryByText('Dato viejo')).toBeNull();
  await fireEvent.press(screen.getByText('Enviar'));
  expect(useTareasHijoViewModel().cambiarEstado).not.toHaveBeenCalled();
});
it('envía la foto junto con el estado y elimina el borrador solo al guardar', async () => {
  saveEvidenceDraft('a1', photo);
  await render(<DetalleTarea />);
  await fireEvent.press(screen.getByText('Enviar'));
  expect(useTareasHijoViewModel().cambiarEstado).toHaveBeenCalledWith('a1', 'completed', photo);
  expect(screen.getByText('Solicitud de confirmación enviada')).toBeTruthy();
});
it('no permite anular una tarea aprobada', async () => {
  useBackendResource.mockReturnValue(resource('verified'));
  await render(<DetalleTarea />);
  expect(screen.queryByText('Anular envío')).toBeNull();
  expect(screen.getByText('Tu padre aprobó esta misión')).toBeTruthy();
});
it('anula una tarea pendiente de revisión con el backend', async () => {
  useBackendResource.mockReturnValue(resource('completed'));
  await render(<DetalleTarea />);
  await fireEvent.press(screen.getByText('Anular envío'));
  expect(useTareasHijoViewModel().cambiarEstado).toHaveBeenCalledWith('a1', 'in_progress');
});
it('muestra fallo del servidor sin simular envío exitoso', async () => {
  useBackendResource.mockReturnValue({ data: null, error: 'Sin conexión', reload: jest.fn(), loading: false });
  await render(<DetalleTarea />);
  expect(screen.getByText('Sin conexión')).toBeTruthy();
  expect(screen.queryByText('Enviar')).toBeNull();
});
