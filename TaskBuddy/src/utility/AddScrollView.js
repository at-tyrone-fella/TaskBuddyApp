import React from "react";
import { ScrollView } from "react-native";

/**
 * This component will Wrap the child component into a ScrollView.
 * Using this component at top level to Wrap all Screens into ScrollView will allow, Scrolling to be extended into all screens.
 * @param {} WrappedComponent 
 * @returns ScrollWrappedComponents
 */
const AddScrollView = (WrappedComponent) => {

  const ComponentWithScrollView = (props) => (
    <ScrollView>
      <WrappedComponent {...props} />
    </ScrollView>
  );

  return ComponentWithScrollView;
};

export default AddScrollView;
