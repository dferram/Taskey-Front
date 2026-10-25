import { render, screen, fireEvent, act } from '@testing-library/react-native';
import DetalleTarea from '../../app/(child)/detalletarea';
import { useTareasHijoViewModel } from '../../viewmodels/useTareasHijoViewModel';
import { __setParams, __resetMocks } from 'expo-router';

jest.mock('../../viewmodels/useTareasHijoViewModel');

describe('<DetalleTarea />', () => {
  beforeEach(() => {
    __resetMocks();
  });

  it('exige foto de evidencia antes de permitir enviar', async () => {
    const cambiarEstado = jest.fn();
    useTareasHijoViewModel.mockReturnValue({ cambiarEstado });
    __setParams({ id: 'assignment-1', title: 'Tender la cama', status: 'in_progress' });

    const originalAlert = global.alert;
    const { Alert } = require('react-native');
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await render(<DetalleTarea />);

    await fireEvent.press(screen.getByText('Enviar'));

    expect(Alert.alert).toHaveBeenCalledWith('Falta evidencia', expect.any(String));
    expect(cambiarEstado).not.toHaveBeenCalled();

    Alert.alert.mockRestore();
    global.alert = originalAlert;
  });

  it('al enviar con evidencia llama a cambiarEstado con status completed', async () => {
    const cambiarEstado = jest.fn().mockResolvedValue({ success: true });
    useTareasHijoViewModel.mockReturnValue({ cambiarEstado });
    __setParams({ id: 'assignment-1', title: 'Tender la cama', status: 'in_progress', photoUri: 'file://foto.jpg' });

    await render(<DetalleTarea />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Enviar'));
    });

    expect(cambiarEstado).toHaveBeenCalledWith('assignment-1', 'completed');
    expect(screen.getByText('Solicitud de confirmación enviada')).toBeTruthy();
  });

  it('muestra el estado ya enviado si la asignacion ya esta completada', async () => {
    useTareasHijoViewModel.mockReturnValue({ cambiarEstado: jest.fn() });
    __setParams({ id: 'assignment-1', title: 'Tender la cama', status: 'completed' });

    await render(<DetalleTarea />);

    expect(screen.getByText('Anular envío')).toBeTruthy();
  });

  it('anular envio llama a cambiarEstado con status in_progress', async () => {
    const cambiarEstado = jest.fn().mockResolvedValue({ success: true });
    useTareasHijoViewModel.mockReturnValue({ cambiarEstado });
    __setParams({ id: 'assignment-1', title: 'Tender la cama', status: 'completed' });

    await render(<DetalleTarea />);

    await act(async () => {
      await fireEvent.press(screen.getByText('Anular envío'));
    });

    expect(cambiarEstado).toHaveBeenCalledWith('assignment-1', 'in_progress');
  });
});
