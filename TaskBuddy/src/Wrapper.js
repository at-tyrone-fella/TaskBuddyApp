import React from 'react';
import {SafeAreaView,StyleSheet} from 'react-native';

const Wrapper = ({ children }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
    },
});

export default Wrapper;