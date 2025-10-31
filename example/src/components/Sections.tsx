import React from "react";
import { StyleSheet, View } from "react-native";

const Section = ({children}: {children: React.JSX.Element[] | React.JSX.Element}) => {
  return (
    <View style={styles.mainContainer}>
      <View style={{opacity: 1}}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CFCED5",
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 5,
    backgroundColor: "#F9F8FD",
    opacity: 0.6,
  }
})

export default Section;
