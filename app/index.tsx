import { AuthRepository } from '../repositories/AuthRepository';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

//verifica que el usuario tenga un token guardadp en cache y redirige a la pantalla correspondiente padre o hijo
export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState('none');

    useEffect(() => {
        const checkToken = async () => {
            try {
                const parentToken = await AuthRepository.getParentToken();
                if (parentToken) {
                    setUserType('parent');
                    return;
                }

                const childToken = await AuthRepository.getChildToken();
                if (childToken) {
                    setUserType('child');
                    return;
                }
            } catch (error) {
                console.log('Error checking token:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkToken();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7E22CE' }}>
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    if (userType === 'parent') {
        return <Redirect href="/principalpapa" />;
    }

    if (userType === 'child') {
        return <Redirect href="/perfilhijo" />;
    }

    return <Redirect href="/PrimeraPantalla" />;
}
