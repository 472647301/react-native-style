import { PixelRatio, Dimensions } from "react-native";
import { StyleSheet, Platform } from "react-native";
import { TextStyle, ViewStyle } from "react-native";

type NamedStyles<T> = StyleSheet.NamedStyles<T>;

const fontScale = PixelRatio.getFontScale();

const { width, height } = Dimensions.get("window");

export function isIphoneX() {
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (height === 780 ||
      width === 780 ||
      height === 812 ||
      width === 812 ||
      height === 844 ||
      width === 844 ||
      height === 896 ||
      width === 896 ||
      height === 926 ||
      width === 926)
  );
}

export function toFixed2(val: number) {
  if (!val) {
    return 0;
  }
  const str = val.toString();
  const index = str.indexOf(".");
  if (index !== -1) {
    return Number(str.substring(0, index + 3));
  }
  return val;
}

export function isObject<T>(val: T): boolean {
  return !!(val && typeof val === "object");
}

export class StyleAdapter {
  private static baseWidth = 375;
  private static baseHeight = 812;
  private static attribute: Array<keyof ViewStyle> = [
    "width",
    "borderBottomEndRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
    "borderBottomStartRadius",
    "borderBottomWidth",
    "borderEndWidth",
    "borderLeftWidth",
    "borderRadius",
    "borderRightWidth",
    "borderStartWidth",
    "borderTopEndRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderTopStartRadius",
    "borderTopWidth",
    "borderWidth",
    "left",
    "margin",
    "marginHorizontal",
    "marginLeft",
    "marginRight",
    "maxWidth",
    "minWidth",
    "padding",
    "paddingHorizontal",
    "paddingLeft",
    "paddingRight",
    "right",
  ];

  public static setBaseSize(width: number, height: number) {
    this.baseWidth = width;
    this.baseHeight = height;
  }

  public static setAttribute(attribute: Array<keyof ViewStyle>) {
    this.attribute = attribute;
  }

  public static scaleWidth(size: number) {
    return toFixed2((width / this.baseWidth) * size);
  }

  public static scaleHeight(size: number) {
    return toFixed2((height / this.baseHeight) * size);
  }

  public static scaleFont(size: number) {
    let newSize = this.scaleWidth(size);
    if (fontScale > 1) {
      newSize = Math.ceil(newSize / fontScale);
    }
    if (Platform.OS === "ios") {
      return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
      return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
  }

  public static viewStyle(
    styles: ViewStyle,
    attribute?: Array<keyof ViewStyle>
  ): ViewStyle {
    const attr = attribute || this.attribute;
    for (let key of attr) {
      if (typeof styles[key] !== "number") {
        continue;
      }
      (styles as any)[key] = this.scaleWidth(styles[key] as number);
    }
    if (typeof styles.width === "number" && typeof styles.height === "number") {
      styles.height = this.scaleWidth(styles.height);
    }
    return styles;
  }

  public static textStyle(styles: TextStyle): TextStyle {
    if (typeof styles.fontSize === "number") {
      return { fontSize: this.scaleFont(styles.fontSize) };
    }
    return {};
  }

  public static create<T extends NamedStyles<T>>(
    styles: T | NamedStyles<T>,
    attribute?: Array<keyof ViewStyle>
  ): T {
    for (let name in styles) {
      if (!isObject(styles[name])) {
        continue;
      }
      const newStyles = Object.assign(
        this.viewStyle(styles[name] as ViewStyle, attribute),
        this.textStyle(styles[name] as TextStyle)
      );
      styles[name] = newStyles as (T | StyleSheet.NamedStyles<T>)[Extract<
        keyof T,
        string
      >];
    }
    return StyleSheet.create(styles);
  }
}
