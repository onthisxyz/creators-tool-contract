
struct Dex {
    uint256 chainId;
    DexType dType;
    address router;
}

struct ShortcutParams {
    address router;
    address tokenOut;
    uint256 chainId;
    uint256 fee;    
    DexType dex;
}

enum DexType {
    V2_UNI_FORK,
    V3_UNI_FORK,
    V2_CAMELOT,
    V3_CAMELOT
}
