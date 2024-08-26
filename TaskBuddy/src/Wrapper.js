import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

/**
 * This component wraps the complete App in SafeAreView with flex:1 to occupy complete space of the safe screen with its children.
 * @param {children}
 * @returns 
 */

const Wrapper = ({ children }) => {

    return (
        <SafeAreaView style={styles.safeArea}>
            {children}
        </SafeAreaView>
    );
}

// Added PropTypes for children
Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
});

export default Wrapper;