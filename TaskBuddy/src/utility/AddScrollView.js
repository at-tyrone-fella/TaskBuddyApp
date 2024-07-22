import React from "react";
import { ScrollView } from "react-native";

const AddScrollView = ( WrappedComponent ) => {
  return(props) => (
    <ScrollView>
        <WrappedComponent {...props}/>
    </ScrollView>
  );
};

export default AddScrollView;


