using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoAppApi.Migrations
{
    /// <inheritdoc />
    public partial class AddDueDateAndGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "due_date",
                table: "todos",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "group_name",
                table: "todos",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "due_date",
                table: "todos");

            migrationBuilder.DropColumn(
                name: "group_name",
                table: "todos");
        }
    }
}
