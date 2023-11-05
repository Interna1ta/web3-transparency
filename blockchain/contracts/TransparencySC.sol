// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TransparencySC is ERC721, Ownable {
    mapping(address => Person) private accounts;
    mapping(uint256 => Attr) public attributes;
    mapping(address => uint256[]) public ownedTokens;
    mapping(uint256 => uint8) private index;
    mapping(uint256 => uint256) public prices;

    bool internal locked;

    event Transaction(
        address indexed _from,
        uint256 indexed _tokenId,
        State indexed _state
    );

    struct Person {
        bool registered;
        string name;
        string location;
        uint256 registered_date;
        Role role;
    }

    struct Attr {
        address createdBy;
        uint256 origin;
        uint8 quantity;
        string product;
        string unit;
        State state;
    }

    enum Role {
        Farmer,
        Baker,
        Customer
    }

    enum State {
        NEW,
        DELIVERED,
        ACCEPTED,
        REJECTED,
        USED,
        ONSALE,
        BOUGHT
    }

    constructor(
        address initialOwner
    ) ERC721("TransparencySC", "TSC") Ownable(initialOwner) {}

    modifier userRegistered() {
        require(
            accounts[msg.sender].registered == true,
            "User must be registered"
        );
        _;
    }

    modifier noReentrant () {
        require (!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    // allow register an address
    function registerUser(
        address _userAddress,
        string memory _name,
        string memory _location,
        uint256 _reg_date,
        Role _role
    ) public onlyOwner {
        require(
            !accounts[_userAddress].registered,
            "There is already an user account created with this address"
        );
        accounts[_userAddress] = Person(
            true,
            _name,
            _location,
            _reg_date,
            _role
        );
    }

    // mint token
    function mint(
        uint256 _fromTokenId,
        uint256 _toTokenId,
        uint8 _quantity,
        string memory _product,
        string memory _unit
    ) external userRegistered {
        if (getUserRole(msg.sender) == Role.Baker) {
            require(
                attributes[_fromTokenId].state == State.ACCEPTED,
                "The token has to be ACCEPTED"
            );

            delete ownedTokens[msg.sender][index[_fromTokenId]];
            attributes[_fromTokenId].state = State.USED;
            _burn(_fromTokenId);
            emit Transaction(msg.sender, _fromTokenId, State.USED);
        }

        _safeMint(msg.sender, _toTokenId);
        attributes[_toTokenId] = Attr({
            createdBy: msg.sender,
            origin: _fromTokenId,
            quantity: _quantity,
            product: _product,
            unit: _unit,
            state: State.NEW
        });
        // update index
        index[_toTokenId] = uint8(ownedTokens[msg.sender].length);
        // minted new token, so update ownedTokens
        ownedTokens[msg.sender].push(_toTokenId);
        // emit event when token is created
        emit Transaction(msg.sender, _toTokenId, State.NEW);
    }

    // transfer token from farmer to baker
    function safeTransferFrom(
        address _to,
        address _from,
        uint256 _tokenId,
        bytes memory _data
    ) public override {
        // transfer the token
        _transfer(_from, _to, _tokenId);
        // @fix test warning
        // https://github.com/OpenZeppelin/openzeppelin-contracts/issues/4709
        // super.safeTransferFrom(_from, _to, _tokenId);
        // now the origin owner wont have it anymore
        delete ownedTokens[_from][index[_tokenId]];
        // the index of the token will be the index in the array of the recipient
        index[_tokenId] = uint8(ownedTokens[_to].length);
        // the recipient will have the new token
        ownedTokens[_to].push(_tokenId);
    }

    function transferToBaker(
        address _baker,
        uint256 _tokenId
    ) external userRegistered {
        safeTransferFrom(_baker, msg.sender, _tokenId);
        // the token state will no longer be NEW
        attributes[_tokenId].state = State.DELIVERED;
        // emit event to track token
        emit Transaction(_baker, _tokenId, State.DELIVERED);
    }

    // accept a token
    function accept(uint256 _tokenId) external {
        require(
            ownerOf(_tokenId) == msg.sender &&
                attributes[_tokenId].state == State.DELIVERED,
            "The token must be delivered to you"
        );

        attributes[_tokenId].state = State.ACCEPTED;
        emit Transaction(msg.sender, _tokenId, State.ACCEPTED);
    }

    // reject a token
    function reject(uint256 _tokenId) external {
        require(
            ownerOf(_tokenId) == msg.sender &&
                attributes[_tokenId].state == State.DELIVERED,
            "The token must be delivered to you"
        );

        safeTransferFrom(attributes[_tokenId].createdBy, msg.sender, _tokenId);
        attributes[_tokenId].state = State.REJECTED;
        emit Transaction(msg.sender, _tokenId, State.REJECTED);
    }

    // put on sale a token
    function putOnSale(uint256 _tokenId, uint256 _price) external {
        require(
            attributes[_tokenId].state == State.NEW,
            "The token must be created by you"
        );

        prices[_tokenId] = _price;
        safeTransferFrom(address(this), msg.sender, _tokenId);
        attributes[_tokenId].state = State.ONSALE;
        emit Transaction(msg.sender, _tokenId, State.ONSALE);
    }

    // allow customer to buy a token
    function buy(uint256 _tokenId) external payable noReentrant {
        require(msg.value >= prices[_tokenId], "There is not enough funds");
        require(
            attributes[_tokenId].state == State.ONSALE,
            "Product is not on sale"
        );
        require(
            ownerOf(_tokenId) == address(this),
            "The token is not available for buying"
        );

        payable(attributes[attributes[_tokenId].origin].createdBy).transfer(
            prices[_tokenId] / 5
        );

        payable(attributes[_tokenId].createdBy).transfer(
            prices[_tokenId] - (prices[_tokenId] / 5)
        );

        safeTransferFrom(msg.sender, address(this), _tokenId);
        attributes[_tokenId].state = State.BOUGHT;
        emit Transaction(msg.sender, _tokenId, State.BOUGHT);
    }

    // allow get user data
    function getUserData(
        address _userAddress
    ) external view returns (string memory, string memory, uint256, Role) {
        return (
            accounts[_userAddress].name,
            accounts[_userAddress].location,
            accounts[_userAddress].registered_date,
            accounts[_userAddress].role
        );
    }

    // allow get attributes of tokenId
    function getTokenAttrs(
        uint256 _tokenId
    )
        external
        view
        returns (address, uint256, uint8, string memory, string memory, State)
    {
        return (
            attributes[_tokenId].createdBy,
            attributes[_tokenId].origin,
            attributes[_tokenId].quantity,
            attributes[_tokenId].product,
            attributes[_tokenId].unit,
            attributes[_tokenId].state
        );
    }

    // allow get all token ids that belong to an address
    function getTokenIds () external view returns (uint256[] memory) {
        return ownedTokens[msg.sender];
    }

    // allow get all token ids that belong to an address
    function getTokenIdsOnSale() external view returns (uint256[] memory) {
        return ownedTokens[address(this)];
    }

    // get role from user address
    function getUserRole(address userAddress) public view returns (Role) {
        return accounts[userAddress].role;
    }

    // get price of a token
    function getPrice(uint256 _tokenId) external view returns (uint256) {
        return prices[_tokenId];
    }

    // get state of a token
    function getState(uint256 _tokenId) external view returns (State) {
        return attributes[_tokenId].state;
    }
}
