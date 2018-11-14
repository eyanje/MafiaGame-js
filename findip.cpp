#include <iostream>
#include <string>

int main() {
    std::string input_string;
    unsigned int input_uint = 0;
    int input_int = 0;

    while (std::getline(std::cin, input_string) && input_string.find("Wireless LAN adapter Wi-Fi:") == std::string::npos);
    while (std::cin >> input_string && input_string.find("IPv4") == std::string::npos);
    while (std::cin >> input_string && input_string.find("Address") == std::string::npos);
    while ((input_int = std::cin.get()) > 0 && input_int != ':');

    std::string ipAddress;
    for (unsigned int i = 0; i < 3; ++i) {
        std::cin >> input_uint;
        ipAddress += std::to_string(input_uint) + ".";
        std::cin.get();
    }
    std::cin >> input_uint;
    ipAddress += std::to_string(input_uint);
    std::cout << "IP Address: " << ipAddress << std::endl;
    return 0;
}