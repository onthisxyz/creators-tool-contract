interface IWeth {
    function balanceOf(address addr) external returns(uint256);
    function withdraw(uint256 _amount) external;
    function approve(address guy, uint wad) external returns (bool);
    function transfer(address dst, uint wad) external returns (bool);
    function deposit() external payable;
}