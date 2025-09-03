/// go.mod ///
module test-project

go 1.21

// Simple test project for LookAtni refactoring demonstration
/// main.go ///
// Package main demonstrates a simple TypeScript-like Go code that needs refactoring
package main

import (
	"fmt"
	"os"
)

// User represents a user in the system
type User struct {
	id    int
	name  string
	email string
}

// GetUserInfo returns user information - needs better error handling
func GetUserInfo(id int) User {
	// Poor error handling - should return error
	if id < 0 {
		fmt.Println("Invalid ID")
		os.Exit(1)
	}

	// Hardcoded data - should use proper data source
	user := User{
		id:    id,
		name:  "John Doe",
		email: "john@example.com",
	}

	return user
}

// PrintUser prints user information - poor naming and no validation
func PrintUser(u User) {
	// No validation of input
	// Poor formatting
	fmt.Printf("ID: %d, Name: %s, Email: %s\n", u.id, u.name, u.email)
}

func main() {
	// No error handling
	user := GetUserInfo(1)
	PrintUser(user)

	// Nested logic - should be extracted
	if user.id > 0 {
		if user.name != "" {
			if user.email != "" {
				fmt.Println("User is valid")
			} else {
				fmt.Println("Email is empty")
			}
		} else {
			fmt.Println("Name is empty")
		}
	}
}
/// utils.go ///
// Package main provides utility functions - needs better organization
package main

import "strings"

// stringUtils - should be separate package or better organized
func stringUtils(s string) string {
	// No validation
	return strings.ToUpper(s)
}

// validateEmail - poor implementation
func validateEmail(email string) bool {
	// Very basic validation - should use proper regex
	return strings.Contains(email, "@")
}
