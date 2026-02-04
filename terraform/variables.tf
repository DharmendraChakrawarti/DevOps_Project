variable "project_name" {
  default = "devops-react-project"
}

variable "instance_type" {
  default = "t3.micro"
}

variable "key_name" {
  description = "Your AWS EC2 Key Pair name"
  type        = string
}
